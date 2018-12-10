import os

from model import *
from flask import Flask, render_template, request
from urllib.request import urlopen as uReq #for crawling
from bs4 import BeautifulSoup as soup #for crawling
from werkzeug.utils import secure_filename #for uploading

app = Flask(__name__)
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
    
    @app.route('/tablepage/', methods=['GET'])
    def tablepage():
        tables = getMySQLTables()
        tabledata = ''
        return render_template('tablepage.html', tables = tables, tabledata = tabledata) 
    
    @app.route('/tableview/', methods=['POST'])
    def tableview():
        tables = getMySQLTables()        
        tablename = request.form.get("tablelist")        
        tabledata = displayTable(tablename)
        return render_template('tablepage.html', tables = tables, tabledata = tabledata) 

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
        return render_template('variablespage.html', cols = combinedcolsarray[0], cols2 = combinedcolsarray[1], tablename = tablename, tablename2 = tablename2)    
    
    @app.route('/chartpage/', methods=['POST'])
    def chartpage():
        plt.clf()
        tablename = request.form.get("tablename")  
        tablename2 = request.form.get("tablename2")           
        variablename = request.form.get("variablelist")  
        variablename2 = request.form.get("variablelist2")  
        
        combinedxyarray = tablesJoin(variablename, variablename2, tablename, tablename2)
        """        
        img = io.BytesIO()

        xi = array(combinedxyarray[0]).astype(np.float)
        A = array([ xi, ones(len(combinedxyarray[0]))])
        
        # (Almost) linear sequence
        y = array(combinedxyarray[1]).astype(np.float)
        maximumY = max(y)
        minimumY = min(y)
        # Generated linear fit
        slope, intercept, r_value, p_value, std_err = stats.linregress(xi,y)
        line = slope*xi+intercept
        
        plt.plot(xi,y,'o', xi, line)
        
        pylab.title('Linear Fit with Matplotlib')
        pylab.xlabel(variablename)
        pylab.ylabel(variablename2)  
        
        plt.autoscale(True)
        plt.grid(True)

        ax = plt.gca()     
        ax.legend(['Observations', 'y = {} + {}x'.format(np.round(intercept,2), np.round(slope,2)) + ', ' + 'r = {}'.format(np.round(r_value, 2))])
 
        fig = plt.gcf()
        plt.savefig(img, format='png')
        img.seek(0)
    
        plot_url = base64.b64encode(img.getvalue()).decode()
        """
        return render_template('chartpage.html', plot_url=plot_url, variablename = variablename, variablename2 = variablename2, tablename = tablename, tablename2 = tablename2, maximumY = maximumY, minimumY = minimumY)  

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