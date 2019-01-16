"""

@author: Beyond Ideas 

"""

import os

from . import modelbi
from flask import Flask, render_template, request, jsonify
from urllib.request import urlopen as uReq #for crawling
from bs4 import BeautifulSoup as soup #for crawling
from werkzeug.utils import secure_filename #for uploading
from array import array
import datetime

def create_app(config_name):
    app = Flask(__name__, static_folder="../../static/dist", template_folder="../../static") #defining how flask find our html, css and javascript
    UPLOAD_FOLDER = os.getcwd() + '\\static\\uploads' #setting a path to our upload folder
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    class HomeClassbi():
        """
            This is the home page
        """
        @app.route("/")
        @app.route("/homebi/")
        def home(): #rendering our home page
            """
                This method will render our home page
            """
            return render_template('homebi.html')

    class UploadClassbi():
        """
            This is the upload page
        """    
        @app.route('/uploadpagebi/')
        def uploadpagebi(): #rendering our upload page
            """
                This method will render our upload page
            """    
            return render_template('uploadpagebi.html')   
        
        @app.route('/uploadbi/', methods = ['POST'])    
        def uploadbi(): #processing our upload
            """
                This method will process our upload
            """        
            file = request.files['inputFile']
            if file:
                filename = secure_filename(file.filename)
                path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(path)            
                message =  modelbi.uploadCSVbi(file.filename, path) 
                os.remove(path)
            if "fail" not in message:
                return render_template('uploadsuccesspagebi.html', message = message)
            else:
                return render_template('uploadfailpagebi.html', message = message)

    class ExportClassbi():
        """
            This is the export page
        """      
        @app.route('/exportpagebi/')
        def exportpagebi(): #rendering our export page
            """
                This method will render our export page
            """      
            return render_template('exportpagebi.html')  
        
        @app.route('/exportbi/', methods = ['POST'])    
        def exportbi(): #processing export for API call from react
            """
                This method will process our export for API call from react
            """      
            tablename = request.form.get("tablename")
            datacontent = modelbi.writeToCSVbi(tablename)
            return datacontent  

    class TableClassbi():
        """
            This is the table view page
        """      
        @app.route('/tablepagebi/')
        def tablepagebi(): #rendering our table view page
            """
                This method will render our table view page
            """      
            return render_template('tablepagebi.html') 
        
        @app.route("/mysqltablesbi/")
        def mysqltablesbi(): #retrieving mysqltables for API call from react
            """
                This method will retrieve mysqltables for API call from react
            """       
            tables = modelbi.getMySQLTablesbi() 
            return jsonify(
                tables = tables
            )

        @app.route('/tableviewbi/', methods = ['POST'])
        def tableviewbi(): #retrieving table display for API call from react      
            """
                This method will retrieve table display for API call from react 
            """           
            tablename = request.form.get("tablename")        
            tabledata = modelbi.displayTablebi(tablename)

            table = ""
            
            for col in tabledata.description:
                table += "<th style=\"width:130px; max-width:130px; word-wrap: break-word;\"><center>" + col[0] + "</center></th>"

            for item in tabledata:
                table += "<tr>"
                for col in item:
                
                    if isinstance(col, datetime.date):
                        col = col.strftime('%d/%m/%Y')
                        
                    table += "<td style=\"width:130px; max-width:130px; word-wrap: break-word;\"><center>" + col + "</center></td>"
                table += "</tr>"

            return table
            
        @app.route('/savejoinedtablebi/', methods = ['POST'])
        def savejoinedtablebi(): #retrieving two tables selected from react
            tablename1 = request.form.get("tablename1")
            tablename2 = request.form.get("tablename2")
            
            return "success"

    class ChartClassbi():
        """
            This is the chart page
        """      
        @app.route('/chartpagebi/')
        def chartpagebi(): #rendering our chart page
            """
                This method will render our chart page
            """      
            return render_template('chartpagebi.html')
        
        @app.route('/variablesbi/', methods = ['POST'])
        def variablesbi(): #retrieving variables for API call from react
            """
                This method will retrieve variables for API call from react
            """     
            tablename = request.form.get("tablename")           
            variablelist = modelbi.getVariablesbi(tablename)    
            
            datevariablelist = modelbi.getDateVariablebi(tablename)  

            return jsonify(
                variablelist = variablelist,            
                datevariablelist = datevariablelist
            )

        @app.route('/scatterplotdatabi/', methods = ['POST'])
        def scatterplotdatabi(): #retrieving mysql data for API call from react
            """
                This method will retrieve mysql data for API call from react
            """     
            tablename = request.form.get("selectedtable")  
            tablename2 = request.form.get("selectedtable2")   

            variablenameX = request.form.get("selectedvariable")  
            variablenameY = request.form.get("selectedvariable2") 

            joinvariable = request.form.get("joinvariable") 
            joinvariable2 = request.form.get("joinvariable2")   

            filterstartdate = request.form.get("filterstartdate")
            filterenddate = request.form.get("filterenddate")               
            
            selecteddatevariable = request.form.get("selecteddatevariable")

            combinedxyarray = modelbi.tablesJoinbi(tablename, tablename2, variablenameX, variablenameY, joinvariable, joinvariable2, filterstartdate, filterenddate, selecteddatevariable)

            return jsonify(
                xarray = combinedxyarray[0],
                yarray = combinedxyarray[1]
            )
        
    class WebCrawlingClassbi():
        """
            This is the web crawling page
        """ 
        @app.route("/webcrawlingpagebi/")
        def webcrawlingpagebi(): #rendering our web crawling page
            """
                This method will render our web crawling page
            """      
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
                
            return render_template('webcrawlingpagebi.html', product_names = product_names)

    return app