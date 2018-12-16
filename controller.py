import os
import json #for correlation
import plotly #for correlation
import plotly.plotly as py #for correlation
import plotly.graph_objs as go #for correlation
import numpy as np #for correlation

from model import *
from flask import Flask, render_template, request, jsonify
from urllib.request import urlopen as uReq #for crawling
from bs4 import BeautifulSoup as soup #for crawling
from werkzeug.utils import secure_filename #for uploading
from array import array

app = Flask(__name__, static_folder="./dist", template_folder="./static")
UPLOAD_FOLDER = os.getcwd() + '\\static\\uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

class HomeClass():

    @app.route("/")
    @app.route("/home/")
    def home():
        return render_template('home.html')

class UploadClass():
    
    @app.route('/uploadpage/')
    def uploadpage():
        return render_template('uploadpage.html')   
    
    @app.route('/upload/', methods=['POST'])    
    def upload():
        file = request.files['inputFile']
        if file:
            filename = secure_filename(file.filename)
            path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(path)            
            message =  uploadCSV(file.filename, path) 
            os.remove(path)
        return render_template('uploadsuccesspage.html', message = message)   

class ExportClass():
    
    @app.route('/exportpage/', methods=['GET'])
    def exportpage():
        tables = getMySQLTables()
        return render_template('exportpage.html', tables = tables)  
    
    @app.route('/export/', methods=['POST'])    
    def export():
        tablename = request.form.get("tablename")
        datacontent = writeToCSV(tablename)
        return render_template('savingpage.html', datacontent = datacontent, tablename = tablename)  

class TableClass():
    
    @app.route('/tablepage/')
    def tablepage():
        return render_template('tablepage.html') 
    
    @app.route('/tableview/', methods=['POST'])
    def tableview():       
        tablename = request.form.get("tablename")        
        tabledata = displayTable(tablename)

        table = ""

        for col in tabledata.description:
            table += "<th style=\"width:130px; max-width:130px; word-wrap: break-word;\"><center>" + col[0] + "</center></th>"

        for item in tabledata:
            table += "<tr>"
            for col in item:
                table += "<td style=\"width:130px; max-width:130px; word-wrap: break-word;\"><center>" + col + "</center></td>"
            table += "</tr>"

        return table

    @app.route("/mysqltables/")
    def mysqltables():
        tables = getMySQLTables() 
        return jsonify(
            tables=tables
        )

class ChartClass():
    
    @app.route('/datasourcepage/', methods=['GET'])   
    def datasourcepage():
        tables = getMySQLTables()        
        return render_template('datasourcepage.html', tables = tables)
    
    @app.route('/variablespage/', methods=['POST'])
    def variablespage():
        tablename = request.form.get("tablelist")  
        tablename2 = request.form.get("tablelist2")          
        combinedcolsarray = getVariables(tablename, tablename2)       
        return render_template('variablespage.html', cols = combinedcolsarray[0], cols2 = combinedcolsarray[1], tablename = tablename, 
            tablename2 = tablename2)    
    
    @app.route('/chartpage/', methods=['POST'])
    def chartpage():
        tablename = request.form.get("tablename")  
        tablename2 = request.form.get("tablename2")           
        variablenameX = request.form.get("variablelist")  
        variablenameY = request.form.get("variablelist2")  
        
        combinedxyarray = tablesJoin(variablenameX, variablenameY, tablename, tablename2)

        xScale = list(np.float_(combinedxyarray[0]))
        yScale = list(np.float_(combinedxyarray[1]))
        maximumY = max(yScale)
        minimumY = min(yScale)

        trace = go.Scatter(
            x = xScale,
            y = yScale,
            mode = 'markers'
        )

        layout= go.Layout(
            title= 'Correlation between ' + variablenameX + ' and ' + variablenameY,
            hovermode= 'closest',
            xaxis= dict(
                title = variablenameX,
                ticklen = 5,
                zeroline = False,
                gridwidth = 2,
            ),
            yaxis = dict(
                title = variablenameY,
                ticklen = 5,
                gridwidth = 2,
            ),
            showlegend = False
        )
        data = go.Data([trace])
        figure = go.Figure(data = data, layout = layout)
        graphJSON = json.dumps(figure, cls = plotly.utils.PlotlyJSONEncoder)
    
        return render_template('chartpage.html', graphJSON = graphJSON, variablenameX = variablenameX, variablenameY = variablenameY, 
            tablename = tablename, tablename2 = tablename2, maximumY = maximumY, minimumY = minimumY)
    
class WebCrawlingClass():

    @app.route("/webcrawlingpage/")
    def webcrawlingpage():
        my_url = 'https://www.newegg.com/Product/ProductList.aspx?Submit=ENE&DEPA=0&Order=BESTMATCH&Description=graphic+card&N=-1&isNodeId=1'
        
        #opening up connection, grabbing the page
        uClient = uReq(my_url)
        page_html = uClient.read()
        uClient.close()
        
        #format the html page
        page_soup = soup(page_html, "html.parser")
        
        #grabs each product
        containers = page_soup.findAll("div", {"class":"item-container"})
        
        product_names = ""
        
        for container in containers:
            product_name = container.a.img["title"]
            product_names += product_name + " "
            
        return render_template('webcrawlingpage.html', product_names = product_names)    

if __name__ == '__main__': #this will run only if you run from this file
    app.run(debug=True)