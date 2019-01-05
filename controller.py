import os

from model import *
from flask import Flask, render_template, request, jsonify
from urllib.request import urlopen as uReq #for crawling
from bs4 import BeautifulSoup as soup #for crawling
from werkzeug.utils import secure_filename #for uploading
from array import array

app = Flask(__name__, static_folder="./dist", template_folder="./static") #defining how flask find our html, css and javascript
UPLOAD_FOLDER = os.getcwd() + '\\static\\uploads' #setting a path to our upload folder
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

class HomeClass():

    @app.route("/")
    @app.route("/home/")
    def home(): #rendering our home page
        return render_template('home.html')

class UploadClass():
    
    @app.route('/uploadpage/')
    def uploadpage(): #rendering our upload page
        return render_template('uploadpage.html')   
    
    @app.route('/upload/', methods = ['POST'])    
    def upload(): #processing our upload
        file = request.files['inputFile']
        if file:
            filename = secure_filename(file.filename)
            path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(path)            
            message =  uploadCSV(file.filename, path) 
            os.remove(path)
        return render_template('uploadsuccesspage.html', message = message)   

class ExportClass():
    
    @app.route('/exportpage/')
    def exportpage(): #rendering our export page
        return render_template('exportpage.html')  
    
    @app.route('/export/', methods = ['POST'])    
    def export(): #processing export for API call from react
        tablename = request.form.get("tablename")
        datacontent = writeToCSV(tablename)
        return datacontent  

class TableClass():
    
    @app.route('/tablepage/')
    def tablepage(): #rendering our table view page
        return render_template('tablepage.html') 
    
    @app.route("/mysqltables/")
    def mysqltables(): #retrieving mysqltables for API call from react
        tables = getMySQLTables() 
        return jsonify(
            tables = tables
        )

    @app.route('/tableview/', methods = ['POST'])
    def tableview(): #retrieving table display for API call from react       
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

class ChartClass():
    
    @app.route('/chartpage/')
    def chartpage(): #rendering our chart page
        return render_template('chartpage.html')
    
    @app.route('/variables/', methods = ['POST'])
    def variables(): #retrieving variables for API call from react
        tablename = request.form.get("tablename")           
        variablelist = getVariables(tablename)       
        return jsonify(
            variablelist = variablelist
        )

    @app.route('/scatterplotdata/', methods = ['POST'])
    def scatterplotdata(): #retrieving mysql data for API call from react
        tablename = request.form.get("selectedtable")  
        tablename2 = request.form.get("selectedtable2")   

        variablenameX = request.form.get("selectedvariable")  
        variablenameY = request.form.get("selectedvariable2") 

        joinvariable = request.form.get("joinvariable") 
        joinvariable2 = request.form.get("joinvariable2")                  
        
        combinedxyarray = tablesJoin(tablename, tablename2, variablenameX, variablenameY, joinvariable, joinvariable2)

        return jsonify(
            xarray = combinedxyarray[0],
            yarray = combinedxyarray[1]
        )
    
class WebCrawlingClass():

    @app.route("/webcrawlingpage/")
    def webcrawlingpage(): #rendering our web crawling page
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

        
class DiuLei():
    print("dog")

class Seksi()
    print("poop")

class andy():

 @app.route("/andy/")
    def andy(): #rendering our web crawling page
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
        
class BItest():
    print("bitest")
