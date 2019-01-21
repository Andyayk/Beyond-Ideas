"""

@author: Beyond Ideas 

"""

import os
import requests

from . import modelbi
from flask import Flask, render_template, request, jsonify
from urllib.request import urlopen as uReq #for crawling
from bs4 import BeautifulSoup as soup #for crawling

def create_app(config_name):
    app = Flask(__name__, static_folder="../../static/dist", template_folder="../../static") #defining how flask find our html, css and javascript
    UPLOAD_FOLDER = os.getcwd() + '\\static\\uploads' #setting a path to our upload folder
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    class TableClassbi():
        """
            This is the table view page
        """ 
        @app.route('/')     
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
            table = modelbi.displayTablebi(tablename)

            return table
            
        @app.route('/savejoinedtablebi/', methods = ['POST'])
        def savejoinedtablebi(): #retrieving combined table for API call from react
            """
                This method will retrieve table display for API call from react 
            """   
            tablename = request.form.get("tablename1")
            tablename2 = request.form.get("tablename2")
			
            joinvariable = request.form.get("selectedjoinvariable")
			
            combinedxyarray = modelbi.tablesViewJoinbi(tablename, tablename2, joinvariable)
            
            return combinedxyarray
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
            allvariablelist = modelbi.getColumnNamebi(tablename)
            variablelist = modelbi.getNumbericalColumnNamebi(tablename)    
            datevariablelist = modelbi.getDateColumnNamebi(tablename)  
            companyvariablelist = modelbi.getCompanyColumnNamebi(tablename)  
            depotvariablelist = modelbi.getDepotColumnNamebi(tablename)  
            geographicallocationvariablelist = modelbi.getGeographicalLocationColumnNamebi(tablename) 

            companyvaluelist = modelbi.getCompanyVariablesbi(tablename)                   

            return jsonify(
                allvariablelist = allvariablelist,
                variablelist = variablelist,            
                datevariablelist = datevariablelist,
                companyvariablelist = companyvariablelist,
                depotvariablelist = depotvariablelist,
                geographicallocationvariablelist = geographicallocationvariablelist,
                companyvaluelist = companyvaluelist
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

            joinvariable = request.form.get("selectedjoinvariable") 

            filtervalue = request.form.get("selectedfiltervalue")
            filtervalue2 = request.form.get("selectedfiltervalue2")               
            
            filtervariable = request.form.get("selectedfiltervariable")

            combinedxyarray = modelbi.tablesJoinbi(tablename, tablename2, variablenameX, variablenameY, joinvariable, filtervalue, filtervalue2, filtervariable)

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
            url = "https://www.wunderground.com/history/daily/sg/river-valley/WSAP/date/2019-1-19?cm_ven=localwx_history"
            weather_r = requests.get(url)
            weather_soup = soup(weather_r.text, 'html.parser')
            #toReturn = weather_soup.prettify()
            toReturn = weather_soup.findAll('a')
            #for link in toReturn:
            #   print(link)

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
            """    
            return render_template('webcrawlingpagebi.html', toReturn = toReturn)

    return app