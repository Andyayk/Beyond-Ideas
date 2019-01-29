"""
@author: Beyond Ideas 
"""

import mysql.connector, datetime, requests, json, csv

#MySQL Configurations
mydb = mysql.connector.connect(
  host = "localhost",
  user = "root",
  passwd = "",
  database = "is480-term1-2018-19"
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
        cursor.execute("USE `is480-term1-2018-19`")
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

def weatherCrawlerbi(startdate, enddate, countryname):
    """
        This method crawl weather data from worldweatheronline
    """ 
    try:
        #Key to call the API, expire 26 March
        api_key = "ab387d44d42d49238a3164423192501"
        #Start & end date indicated by user
        input_start_date = startdate
        input_end_date = enddate
        #Country indicated by user
        country_name = countryname
        #Basic URL for crawling
        base_url = "http://api.worldweatheronline.com/premium/v1/past-weather.ashx"
        #Setting the header and body array to be placed into csv file.
        headerArray = "date,meanTemperatureC,meanTemperatureF"
        bodyArray = []
        #extracting the months in integer
        startMonth = int(input_start_date[5:7])
        endMonth = int(input_end_date[5:7])
        #Start crawling, if it is same month, send only 1 API request
        if startMonth == endMonth:
            #setting up the url
            url = base_url + "?key=" + api_key + "&q=" + country_name + "&date=" + input_start_date + "&enddate=" + input_end_date +"&tp=24&format=json"
            weather_r = requests.get(url)
            weather_text = weather_r.text
            #parsing the text into json format to retrieval
            weather_dic = json.loads(weather_text)
            for i in weather_dic["data"]["weather"]:
                #retrieve date
                date = str(i["date"])
                #retrieve mean temperature in celcius
                meanTemperatureC = str(i["hourly"][0]["tempC"])
                #retrieve mean temperature in fahrenheit
                meanTemperatureF = str(i["hourly"][0]["tempF"])
                #combine the rows
                rows = date + "," + meanTemperatureC + "," + meanTemperatureF
                #add the rows in to an array to be placed in csv file later on
                bodyArray.append(rows)
        #if not, deduct the number of months needed to crawl and send 1 api for each month.
        else:
            #calculating the number of months needed to loop which is the number of api calls
            num_of_months = int(endMonth) - int(startMonth)
            #separating the year, month, and date for easier modification.
            start_crawl_year = int(input_start_date[0:4])
            start_crawl_month = int(input_start_date[5:7])
            start_crawl_day = int(input_start_date[8:10])
            end_crawl_year = int(input_end_date[0:4])
            end_crawl_month = int(input_end_date[5:7])
            end_crawl_day = int(input_end_date[8:10])  
            #loop based on the number of months input by the user  
            while num_of_months >= 0:
                start_crawl_date = str(start_crawl_year) + "-" + str(start_crawl_month) + "-" + str(start_crawl_day)
                end_crawl_date = str(end_crawl_year) + "-" + str(end_crawl_month) + "-" + str(end_crawl_day)
                #for last input month, the last date to crawl would be the input date
                if num_of_months == 0:
                    end_crawl_date = input_end_date
                    #setting up the url
                    url = base_url + "?key=" + api_key + "&q=" + country_name + "&date=" + start_crawl_date + "&enddate=" + end_crawl_date+"&tp=24&format=json"
                    weather_r = requests.get(url)
                    weather_text = weather_r.text
                    #parsing the text into json format to retrieval
                    weather_dic = json.loads(weather_text)
                    for i in weather_dic["data"]["weather"]:
                        #retrieve date
                        date = str(i["date"])
                        #retrieve mean temperature in celcius
                        meanTemperatureC = str(i["hourly"][0]["tempC"])
                        #retrieve mean temperature in fahrenheit
                        meanTemperatureF = str(i["hourly"][0]["tempF"])
                        #combine the rows
                        rows = date + "," + meanTemperatureC + "," + meanTemperatureF
                        #add the rows in to an array to be placed in csv file later on
                        bodyArray.append(rows)        
                else:
                    #for first till penultimate input month, set the last date for each month based on the calendar.
                    #setting the start and end date
                    if start_crawl_month == 4 or start_crawl_month == 6 or start_crawl_month == 9 or start_crawl_month == 11:
                        end_crawl_date = str(start_crawl_year) + "-" + str(start_crawl_month) + "-30" 
                    elif start_crawl_month == 2:
                        end_crawl_date = str(start_crawl_year) + "-" + str(start_crawl_month) + "-28" 
                    else:
                        end_crawl_date = str(start_crawl_year) + "-" + str(start_crawl_month) + "-31" 
                    url = base_url + "?key=" + api_key + "&q=" + country_name + "&date=" + start_crawl_date + "&enddate=" + end_crawl_date + "&tp=24&format=json"
                    weather_r = requests.get(url)
                    weather_text = weather_r.text
                    #parsing the text into json format to retrieval
                    weather_dic = json.loads(weather_text)
                    for i in weather_dic["data"]["weather"]:
                        #retrieve date
                        date = str(i["date"])
                        #retrieve mean temperature in celcius
                        meanTemperatureC = str(i["hourly"][0]["tempC"])
                        #retrieve mean temperature in fahrenheit
                        meanTemperatureF = str(i["hourly"][0]["tempF"])
                        #combine the rows
                        rows = date + "," + meanTemperatureC + "," + meanTemperatureF
                        #add the rows in to an array to be placed in csv file later on
                        bodyArray.append(rows) 
                    start_crawl_month += 1
                    start_crawl_day = 1
                num_of_months-=1

        #write the data into a csv file
        filename = country_name + " weather data.csv"
        with open(filename, "w+") as csvfile:
            csvfile.write(headerArray)
            csvfile.write("\n")
            for i in bodyArray:
                csvfile.write(i)
                csvfile.write("\n")
        return "Successfully crawled weather data."
    except Exception as e:
        return "Crawling of weather data unsuccessful."           