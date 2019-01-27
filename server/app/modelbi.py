"""
@author: Beyond Ideas 
"""

import mysql.connector, datetime, requests, json, csv

#MySQL Configurations
mydb = mysql.connector.connect(
  host = "localhost",
  user = "root",
  passwd = "",
  database = "app"
)
cursor = mydb.cursor(buffered=True)    

def is_emptybi(any_structure):
    """
        This method will check something is empty or not
    """     
    if any_structure:
        return False
    else:
        return True

def getMySQLTablesbi():
    """
        This method will get all MySQL tables
    """    
    try:
        cursor.execute("USE app")
        cursor.execute("SHOW TABLES")
        tables = []
        for (table_name,) in cursor:
            tables.append(table_name)
        return tables
    except Exception as e:
        return "Something is wrong with getMySQLTablesbi method"    
 
def displayTablebi(table_name):
    """
        This method will display table 
    """      
    try:
        cursor.execute("SELECT * FROM `" + table_name + "` LIMIT 20")
        
        cols = []
        for col in cursor.description:
            cols.append(col[0])

        tabledata = []
        for item in cursor:
            row = []
            for col in item:
                row.append(col)   
            tabledata.append(row) 

        tablearray = []
        tablearray.append(cols)
        tablearray.append(tabledata)

        return tablearray
    except Exception as e:
        return "Something is wrong with displayTable method"

def tablesJoinbi(tablename, tablename2, variablenameX, variablenameY, joinvariable, filtervalue, filtervalue2, filtervariable):
    """
        This method will join tables together using date or company or depot or geographical location
    """
    try:
        sqlstmt = "SELECT t1." + variablenameX + " , t2." + variablenameY + " FROM " + tablename + " as t1 , " + tablename2 + " as t2"
        
        if "date" in joinvariable.lower(): #join by date
            date1 = getDateColumnNamebi(tablename)
            date2 = getDateColumnNamebi(tablename2)
           
            sqlstmt = sqlstmt + " WHERE t1." + date1[0] + " = t2." + date2[0]
        else:
            sqlstmt = sqlstmt + " WHERE t1." + joinvariable + " = t2." + joinvariable   
        
        
        if "date" in filtervariable.lower(): #filter by date
            sqlstmt = sqlstmt + " AND " + filtervariable + " BETWEEN '" + filtervalue + "' AND '" + filtervalue2 + "'"
        elif not filtervariable == "":
            sqlstmt = sqlstmt + " AND " + filtervariable + " = '" + filtervalue + "'"
        else:
            sqlstmt = sqlstmt
            
        cursor.execute(sqlstmt)

        cols = []
        x = []
        y = []
        for col in cursor.description: # add table cols
            cols.append(col[0])    
        
        for row_data in cursor: #add table rows
            if is_emptybi(row_data[0]):
                x.append(0)
            else: 
                x.append(row_data[0])
            
            if is_emptybi(row_data[1]):    
                y.append(0)
            else:             
                y.append(row_data[1])
          
        combinedxyarray = []
        combinedxyarray.append(x)
        combinedxyarray.append(y)

        return combinedxyarray
    except Exception as e:
        return "Something is wrong with tablesJoinbi method"   

def tablesViewJoinbi(variables, tablename, tablename2, joinvariable):
    """
        This method will join two tables together and save to MySQL database
    """
    try:
        cursor.execute("DROP TABLE IF EXISTS combinedtable")
        sqlstmt = "CREATE TABLE combinedtable AS SELECT "+ variables + " FROM " + tablename + " as t1 INNER JOIN " + tablename2 + " as t2"
        
        if "activitydate" in joinvariable.lower(): #join by date
            sqlstmt = sqlstmt + " WHERE t1." + "date" + " = t2." + "ActivityDate"
        elif "company" in joinvariable.lower(): #join by company
            sqlstmt = sqlstmt + " WHERE t1." + "company" + " = t2." + "company"   
        elif "depot" in joinvariable.lower(): #join by depot
            sqlstmt = sqlstmt + " ON t1." + "depot" + " = t2." + "SKUKey"  
        elif "geographicallocation" in joinvariable.lower(): #join by geographical location
            sqlstmt = sqlstmt + " WHERE t1." + "geographicallocation" + " = t2." + "geographicallocation"                       
        # sqlstmt = "CREATE TABLE potlala (id INT NOT NULL PRIMARY KEY, name  VARCHAR(40), email VARCHAR(40))"
        cursor.execute(sqlstmt)

        return "success"
    except Exception as e:
        return "Something is wrong with tablesViewJoinbi method"

def getNumericalColumnNamebi(table_name): 
    """
        This method will get selected variables data (numerical variables column names only)
    """    
    try:   
        cols = []
        
        cursor.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + table_name + "' AND DATA_TYPE IN ('TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', 'DECIMAL', 'FLOAT', 'DOUBLE', 'REAL', 'BIT', 'BOOLEAN', 'SERIAL')")
        for col in cursor: # add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return "Something is wrong with getNumericalColumnNamebi method"    
        
def getVarcharColumnNamebi(table_name):
    """
        This method will get selected variables data (varchar variables column names only)
    """    
    try:   
        cols = []
        
        cursor.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + table_name + "' AND DATA_TYPE IN ('VARCHAR', 'date')")
        for col in cursor: # add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return "Something is wrong with getVarcharColumnNamebi method" 

def getDateColumnNamebi(tablename):
    """
        This method will get date variables column names only
    """ 
    try:
        cursor.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND DATA_TYPE = 'date'")

        cols = []

        for col in cursor: #add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return "Something is wrong with getDateColumnNamebi method"    

def getCompanyColumnNamebi(tablename):
    """
        This method will get company variables column names only
    """ 
    try:
        cursor.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND COLUMN_NAME LIKE '%company%'")

        cols = []

        for col in cursor: #add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return "Something is wrong with getCompanyColumnNamebi method"   

def getDepotColumnNamebi(tablename):
    """
        This method will get depot variables column names only
    """ 
    try:
        cursor.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND COLUMN_NAME LIKE '%depot%'")

        cols = []

        for col in cursor: #add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return "Something is wrong with getDepotColumnNamebi method"   

def getGeographicalLocationColumnNamebi(tablename):
    """
        This method will get geographical location variables column names only
    """ 
    try:
        cursor.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND COLUMN_NAME LIKE '%location%'")

        cols = []

        for col in cursor: #add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return "Something is wrong with getGeographicalLocationColumnNamebi method"   

def getCompanyValuesbi(tablename):
    """
        This method will get company values only
    """ 
    try:
        cursor.execute("SELECT DISTINCT Company FROM " + tablename)

        cols = []

        for col in cursor: #add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return ""   

def getDepotValuesbi(tablename):
    """
        This method will get depot values only
    """ 
    try:
        cursor.execute("SELECT DISTINCT Depot FROM " + tablename)

        cols = []

        for col in cursor: #add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return ""      

def getGeographicalLocationValuesbi(tablename):
    """
        This method will get geographical location values only
    """ 
    try:
        cursor.execute("SELECT DISTINCT GeographicalLocation FROM " + tablename)

        cols = []

        for col in cursor: #add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return ""                 
        
def getFilterValuesbi(tablename, tablename2, filtervariable):
    """
        This method will get the values based on the filter variable
    """ 
    try:
        cursor.execute("SELECT DISTINCT " + filtervariable[3:] + " FROM " + tablename + "," + tablename2)

        cols = []

        for col in cursor: #add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return "" 

def weatherCrawlerbi():
    """
        This method crawl weather data from worldweatheronline
    """ 
    try:
        #Key to call the API, expire 26 March
        api_key = "7aaa215e79fc453780042854192501"
        #Start & end date indicated by user
        start_date = "2018-11-01"
        end_date = "2018-11-30"
        #Country indicated by user
        country_name = "Singapore"
        #Basic URL for crawling
        base_url = "http://api.worldweatheronline.com/premium/v1/weather.ashx"
        #Setting the header and body array to be placed into csv file.
        headerArray = "date,meanTemperatureC,meanTemperatureF"
        bodyArray = []
        #Cleaning the start and end date by removing the "0" infront of the DD.
        start_dateDD = start_date[8:10]
        end_dateDD = end_date[8:10]
        if start_dateDD[0] == "0":
            start_dateDD = start_dateDD[1]

        if end_dateDD[0] == "0":
            end_dateDD = end_dateDD[1]

        cleaned_start_date = start_date[0:8] + start_dateDD   
        #Changing the start and end date into integer so that at the end of every iteration, the DD is increase by 1.
        start_dateDD = int(start_dateDD)
        end_dateDD = int(end_dateDD)
        #Count the number of days from the start and end so that the iteration will loop through each day.
        counter = end_dateDD - start_dateDD + 1
        #Start crawling
        while counter > 0:
            #setting up the url
            url = base_url + "?key=" + api_key + "&q=" + country_name + "&date=" + cleaned_start_date + "&tp=24&format=json"
            weather_r = requests.get(url)
            weather_text = weather_r.text
            #parsing the text into json format to retrieval
            weather_dic = json.loads(weather_text)
            #retrieve date
            date = str(weather_dic["data"]["weather"][0]["date"])
            #retrieve mean temperature in celcius
            meanTemperatureC = str(weather_dic["data"]["weather"][0]["hourly"][0]["tempC"])
            #retrieve mean temperature in fahrenheit
            meanTemperatureF = str(weather_dic["data"]["weather"][0]["hourly"][0]["tempF"])
            rows = date + "," + meanTemperatureC + "," + meanTemperatureF
            #add the rows in to an array to be placed in csv file later on
            bodyArray.append(rows)
            #increase the start date by 1 for the next iteration to crawl
            start_dateDD+=1
            cleaned_start_date = start_date[0:8] + str(start_dateDD)
            #decrease counter by 1 and when it reach 0, the iteration stops
            counter-=1

        #write the data into a csv file
        filename = country_name + " weather data.csv"
        print("came here")
        with open(filename, "w+") as csvfile:
            csvfile.write(headerArray)
            csvfile.write("\n")
            for i in bodyArray:
                csvfile.write(i)
                csvfile.write("\n")
        return "Successfully crawled weather data."

    except Exception as e:
        return "Crawling of weather data unsuccessful."           