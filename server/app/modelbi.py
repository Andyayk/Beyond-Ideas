"""
@author: Beyond Ideas 
"""

import mysql.connector, datetime, requests, json, csv, os, time, io, math, random, operator, re, sqlalchemy, pickle, nltk, gensim
import pandas as pd
import numpy as np
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem.porter import *
from nltk.stem import WordNetLemmatizer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
from sklearn import metrics
from twython import Twython
from io import StringIO
from sqlalchemy import create_engine
from sqlalchemy.sql import text
from pandas import DataFrame
from gensim.models import CoherenceModel

engine = create_engine('mysql://root:@localhost/is480-term1-2018-19')

connection = engine.connect()

def is_emptybi(any_structure):
    """
        This method will check something is empty or not
    """     
    if any_structure:
        return False
    else:
        return True

def displayTablebi(table_name):
    """
        This method will display table 
    """      
    try:
        resultQuery = text("SELECT * FROM `" + table_name + "`")
        result = connection.execute(resultQuery)

        cols = []
        columnQuery = text("SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema='is480-term1-2018-19' AND table_name='" + table_name + "'")
        header = connection.execute(columnQuery)
        
        for col in header:
            for cl in col:
                cols.append(cl)

        tabledata = []
        for item in result:
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
        This method will join tables together using date or company or depot or country name
    """
    try:
        sqlstmtQuery = ""
        date1 = ""
        date2 = ""
        
        if "sentiment" in tablename:
            if "sentiment" in variablenameX:
                sqlstmtQuery = "SELECT COUNT(t1." + variablenameX + ") , t2." + variablenameY + " FROM `" + tablename + "` as t1 , `" + tablename2 + "` as t2"
            else:
                sqlstmtQuery = "SELECT CAST(SUM(t1." + variablenameX + ") as UNSIGNED) , t2." + variablenameY + " FROM `" + tablename + "` as t1 , `" + tablename2 + "` as t2"
                
            if "date" in joinvariable.lower(): #join by date
                date1 = getDateColumnNamebi(tablename)
                date2 = getDateColumnNamebi(tablename2)

                sqlstmtQuery = sqlstmtQuery + " WHERE t1." + date1[0] + " = t2." + date2[0] + " AND sentiment = 1"
            else:
                sqlstmtQuery = sqlstmtQuery + " WHERE t1." + joinvariable + " = t2." + joinvariable + " AND sentiment = 1"

        elif "sentiment" in tablename2:
            if "sentiment" in variablenameY:
                sqlstmtQuery = "SELECT t1." + variablenameX + " , COUNT(t2." + variablenameY + ") FROM `" + tablename + "` as t1 , `" + tablename2 + "` as t2"
            else:
                sqlstmtQuery = "SELECT t1." + variablenameX + " , CAST(SUM(t2." + variablenameY + ") as UNSIGNED) FROM `" + tablename + "` as t1 , `" + tablename2 + "` as t2"
                
            if "date" in joinvariable.lower(): #join by date
                date1 = getDateColumnNamebi(tablename)
                date2 = getDateColumnNamebi(tablename2)

                sqlstmtQuery = sqlstmtQuery + " WHERE t1." + date1[0] + " = t2." + date2[0] + " AND sentiment = 1"
            else:
                sqlstmtQuery = sqlstmtQuery + " WHERE t1." + joinvariable + " = t2." + joinvariable + " AND sentiment = 1"

        else:
            sqlstmtQuery = "SELECT t1." + variablenameX + " , t2." + variablenameY + " FROM `" + tablename + "` as t1 , `" + tablename2 + "` as t2"

            if "date" in joinvariable.lower(): #join by date
                date1 = getDateColumnNamebi(tablename)
                date2 = getDateColumnNamebi(tablename2)
               
                sqlstmtQuery = sqlstmtQuery + " WHERE t1." + date1[0] + " = t2." + date2[0]
            else:
                sqlstmtQuery = sqlstmtQuery + " WHERE t1." + joinvariable + " = t2." + joinvariable   
    
    
        if "date" in filtervariable.lower(): #filter by date
            sqlstmtQuery = sqlstmtQuery + " AND " + filtervariable + " BETWEEN '" + filtervalue + "' AND '" + filtervalue2 + "'"
        elif not filtervariable == "":
            sqlstmtQuery = sqlstmtQuery + " AND " + filtervariable + " = '" + filtervalue + "'"
        else:
            sqlstmtQuery = sqlstmtQuery

        if "sentiment" in tablename:
            sqlstmtQuery = sqlstmtQuery + " GROUP BY t1." + date1[0] + " , sentiment"

        elif "sentiment" in tablename2:
            sqlstmtQuery = sqlstmtQuery + " GROUP BY t2." + date2[0] + " , sentiment"
            
        sqlstmt = connection.execute(sqlstmtQuery)
        x = []
        y = []
        for row_data in sqlstmt: #add table rows
            print(row_data)
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

def tablesViewJoinbi(variables, tablename, tablename2, joinvariable, combinedtablename, userID):
    """
        This method will join two tables together and save to MySQL database
    """
    try:
        connection.execute("DROP TABLE IF EXISTS `"+ combinedtablename + "`")
        sqlstmt = "CREATE TABLE `"+ combinedtablename + "` AS SELECT "+ variables + " FROM `" + tablename + "` as t1 INNER JOIN `" + tablename2 + "` as t2"
        
        if "date" in joinvariable.lower(): #join by date
            date1 = getDateColumnNamebi(tablename)
            date2 = getDateColumnNamebi(tablename2)
           
            sqlstmt = sqlstmt + " WHERE t1." + date1[0] + " = t2." + date2[0]
        else:
            sqlstmt = sqlstmt + " WHERE t1." + joinvariable + " = t2." + joinvariable
        connection.execute(sqlstmt)

        connection.execute("DELETE FROM user_data WHERE data_name = '" + combinedtablename + "'")
        timestamp = datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
        connection.execute("INSERT INTO user_data (data_name,user_id,upload_date) VALUES ( \"" + combinedtablename + "\", " + str(userID) + ", \"" + str(timestamp) + "\");")

        return "success"
    except Exception as e:
        return "Something is wrong with tablesViewJoinbi method"

def getNumericalColumnNamebi(table_name): 
    """
        This method will get selected variables data (numerical variables column names only)
    """    
    try:   
        cols = []
        
        result = connection.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + table_name + "' AND DATA_TYPE IN ('TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', 'DECIMAL', 'FLOAT', 'DOUBLE', 'REAL', 'BIT', 'BOOLEAN', 'SERIAL')")
        for col in result: # add table cols]
            for cl in col:
                cols.append(cl)

        return cols
    except Exception as e:
        return "Something is wrong with getNumericalColumnNamebi method"    
        
def getAllColumnNamebi(table_name):
    """
        This method will get selected variables data
    """    
    try:   
        cols = []
        
        result = connection.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + table_name + "'")
        for col in result: # add table cols
            for cl in col:
                cols.append(cl)

        return cols
    except Exception as e:
        return "Something is wrong with getVarcharColumnNamebi method" 

def getDateColumnNamebi(tablename):
    """
        This method will get date variables column names only
    """ 
    try:
        result = connection.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND DATA_TYPE = 'date'")

        cols = []

        for col in result: #add table cols
            for cl in col:
                cols.append(cl)

        return cols
    except Exception as e:
        return "Something is wrong with getDateColumnNamebi method"    

def getCompanyColumnNamebi(tablename):
    """
        This method will get company variables column names only
    """ 
    try:
        result = connection.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND COLUMN_NAME LIKE '%%company%%'")
        cols = []

        for col in result: #add table cols
            for cl in col:
                cols.append(cl)

        return cols
    except Exception as e:
        return "Something is wrong with getCompanyColumnNamebi method"   

def getDepotColumnNamebi(tablename):
    """
        This method will get depot variables column names only
    """ 
    try:
        result = connection.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND COLUMN_NAME LIKE '%%depot%%'")

        cols = []

        for col in result: #add table cols
            for cl in col:
                cols.append(cl)

        return cols
    except Exception as e:
        return "Something is wrong with getDepotColumnNamebi method"   

def getCountryNameColumnNamebi(tablename):
    """
        This method will get country name variables column names only
    """ 
    try:
        result = connection.execute("SELECT DISTINCT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND COLUMN_NAME LIKE '%%country%%'")

        cols = []
        for col in result: #add table cols
            for cl in col:
                cols.append(cl)

        return cols
    except Exception as e:
        return "Something is wrong with getCountryNameColumnNamebi method"   

def getCompanyValuesbi(tablename):
    """
        This method will get company values only
    """ 
    try:
        result = connection.execute("SELECT DISTINCT Company FROM `" + tablename + "`")

        cols = []

        for col in result: #add table cols
            for cl in col:
                cols.append(cl)

        return cols
    except Exception as e:
        return ""   

def getDepotValuesbi(tablename):
    """
        This method will get depot values only
    """ 
    try:
        result = connection.execute("SELECT DISTINCT Depot FROM `" + tablename + "`")

        cols = []

        for col in result: #add table cols
            for cl in col:
                cols.append(cl)

        return cols
    except Exception as e:
        return ""      

def getCountryNameValuesbi(tablename):
    """
        This method will get country name values only
    """ 
    try:
        result = connection.execute("SELECT DISTINCT CountryName FROM `" + tablename + "`")

        cols = []

        for col in result: #add table cols
            for cl in col:
                cols.append(cl)

        return cols
    except Exception as e:
        return ""                 
        
def getFilterValuesbi(tablename, tablename2, filtervariable):
    """
        This method will get the values based on the filter variable
    """ 
    try:
        result = connection.execute("SELECT DISTINCT " + filtervariable[3:] + " FROM `" + tablename + "` , `" + tablename2 + "`")

        cols = []

        for col in result: #add table cols
            for cl in col:
                cols.append(cl)

        return cols
    except Exception as e:
        return "" 

def getSentimentDataForTableDisplay(usertablename):
    try:
        # Load dataset 
        sqlstmtQuery = "SELECT * FROM `" + usertablename + "`"

        df = pd.read_sql(sqlstmtQuery, connection) # Change sql to dataframe

        sliceddf = df[['tweet','date','tweettime','sentiment_score']]

        columns = sliceddf.columns.tolist()
        values = sliceddf.values.tolist()

        return [columns, values]
    except Exception as e:
        print(str(e))
        return "Something is wrong with getSentimentDataForTableDisplay method"

def getSentimentDataForChart(usertablename):
    try:
        # Load dataset 
        sqlstmtQuery = "SELECT * FROM `" + usertablename + "`"

        df = pd.read_sql(sqlstmtQuery, connection) # Change sql to dataframe

        sentimentcolumn = df['sentiment'].tolist()

        aggregatedsentiment = [sentimentcolumn.count(1), sentimentcolumn.count(0)] #1 is positive, 0 is negative

        return aggregatedsentiment
    except Exception as e:
        print(str(e))
        return "Something is wrong with getSentimentDataForChart method"

def weatherCrawlerbi(startdate, enddate, countryname, saveToDB, userID, filename):
    """
        This method crawl weather data from worldweatheronline
    """ 
    #print("line 315")
    #print(saveToDB)
    try:
        #Key to call the API, expire 27 April
        with open(os.getcwd()+"\\instance\\weather_credentials.json", "r") as file:  
            creds = json.load(file)
        api_key = str(creds['API_KEY'])
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
        startYear = int(input_start_date[0:4])
        endYear = int(input_end_date[0:4])
        #Start crawling, if it is same month, send only 1 API request
        if startMonth == endMonth and startYear == endYear:
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
                rows = "\"" + date + "\"" + "," + meanTemperatureC + "," + meanTemperatureF
                #add the rows in to an array to be placed in csv file later on
                bodyArray.append(rows)
        #if not, deduct the number of months needed to crawl and send 1 api for each month.
        else:
            #calculating the number of months needed to loop which is the number of api calls
            num_of_months = (endYear - startYear) * 12 - startMonth + endMonth
            if startYear == endYear:
                num_of_months = endMonth - startMonth
            #separating the year, month, and date for easier modification.
            start_crawl_year = int(input_start_date[0:4])
            start_crawl_month = int(input_start_date[5:7])
            start_crawl_day = int(input_start_date[8:10])
            end_crawl_year = int(input_end_date[0:4])
            end_crawl_month = int(input_end_date[5:7])
            end_crawl_day = int(input_end_date[8:10])  
            #loop based on the number of months input by the user  
            while num_of_months >= 0:
                """
                print("this is number of months " + str(num_of_months))
                print("this is start month " + str(start_crawl_month))
                print("this is start year " + str(start_crawl_year))
                print("this is end month " + str(end_crawl_month))
                print("this is end year " + str(end_crawl_year))
                """
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
                        rows = "\"" + date + "\"" + "," + meanTemperatureC + "," + meanTemperatureF
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
                        rows = "\"" + date + "\"" + "," + meanTemperatureC + "," + meanTemperatureF
                        #add the rows in to an array to be placed in csv file later on
                        bodyArray.append(rows)
                    if start_crawl_month == 12:
                        start_crawl_month = 1
                        start_crawl_year += 1
                    else:
                        start_crawl_month += 1
                    start_crawl_day = 1
                num_of_months-=1
        if saveToDB == "true":        
            tableName = filename + "_" + str(userID)
            connection.execute("DROP TABLE IF EXISTS `"+ tableName + "`")
            connection.execute("CREATE TABLE `" + tableName + "` (date date, meanTemperatureC int(2), meanTemperatureF int(2));")
            
            connection.execute("DELETE FROM user_data WHERE data_name = '" + tableName + "'")
            timestamp = datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
            connection.execute("INSERT INTO user_data (data_name,user_id,upload_date) VALUES ( \"" + tableName + "\", " + str(userID) + ", \"" + str(timestamp) + "\");")
            status = insertToDatabase(headerArray, bodyArray, tableName)
            return "success"
        else:
            #write the data into a csv file
            returnStr = headerArray
            returnStr += "\n"
            for i in bodyArray:
                returnStr += i
                returnStr += "\n"
            #print(returnStr)
            return returnStr
    except Exception as e:
        print(e)
        return "Retrieval of weather data unsuccessful."           

def twitterCrawlerbi(tags, nooftweets, datebefore, saveToDB, userID, filename):
    """
        This method crawl data from Twitter
    """
    #load credentials from json file        
    with open(os.getcwd()+"\\instance\\twitter_credentials.json", "r") as file:  
        creds = json.load(file)

    #instantiate an object
    twitter = Twython(creds['CONSUMER_KEY'], creds['CONSUMER_SECRET'])
    
    #'"developer" OR "designer" OR "social media"'
    splittags = tags.split(",")
    searchQuery = ""

    if len(splittags) == 1:
        searchQuery = "'" + splittags[0].strip() + "'" 
    elif len(splittags) >= 2:
        counter = 1 
        for tag in splittags:
            searchQuery += "'" + tag.strip() + "'"
            if counter < len(splittags):
                searchQuery += ' OR '
            counter+=1

    tweetsPerQuery = 100
    tweets = []
    apicalllimit = ""
    apicallreset = ""
    maxTweets = int(nooftweets)

    #if results from a specific ID onwards are reqd, set since_id to that ID.
    #else default to no lower limit, go as far back as API allows
    sinceId = None

    #if results only below a specific ID are, set max_id to that ID.
    #else default to no upper limit, start from the most recent tweet matching the search query.
    max_id = -1

    tweetCount = 0
    query = {
        'q': searchQuery, 
        'lang': 'en',
        'count': tweetsPerQuery,
        'until': datebefore
    }

    headerArray = "tweetid,userid,name,tweet,retweet_count,favorite_count,followers_count,friends_count,date,tweettime"

    while tweetCount < maxTweets:
        if max_id <= 0: #first
            if not sinceId: #do normal query first
                query = {
                    'q': searchQuery, 
                    'lang': 'en',
                    'count': tweetsPerQuery,
                    'until': datebefore
                }
            else:
                query = {
                    'q': searchQuery, 
                    'lang': 'en',
                    'count': tweetsPerQuery,
                    'since_id': sinceId,
                    'until': datebefore
                }                    
        else:
            if not sinceId:
                query = {
                    'q': searchQuery, 
                    'lang': 'en',
                    'count': tweetsPerQuery,
                    'max_id': str(max_id - 1),
                    'until': datebefore
                }                    
            else:
                query = {
                    'q': searchQuery, 
                    'lang': 'en',
                    'count': tweetsPerQuery,
                    'max_id': str(max_id - 1),
                    'since_id': sinceId,
                    'until': datebefore                   
                }                     
        try:
            new_tweets = twitter.search(**query)['statuses']

            if not new_tweets:
                break     

            tweetCount += len(new_tweets)
            max_id = new_tweets[-1]['id']

            for result in new_tweets:  
                created_at = result['created_at'] #Wed Dec 19 20:20:32 +0000 2007
                datesplit = created_at.split(" ")

                t = datetime.datetime(int(datesplit[5]), int(time.strptime(datesplit[1],'%b').tm_mon), int(datesplit[2]), 0, 0)
                dateformatted = t.strftime('%Y-%m-%d')  

                tweetid = str(result['id'])
                userid = str(result['user']['id'])
                name = re.sub(r'[^a-zA-Z]+', ' ', result['user']['name'])
                tweet = re.sub(r'https?://\S+|[^a-zA-Z]+', ' ', result['text'])
                retweet_count = str(result['retweet_count'])
                favorite_count = str(result['favorite_count'])
                followers_count = str(result['user']['followers_count'])
                friends_count = str(result['user']['friends_count'])
                date = dateformatted
                tweettime = datesplit[3]

                row = tweetid + "," + userid + "," + "\"" + name + "\"" + "," + "\"" + tweet + "\"" + "," \
                    + "\"" + retweet_count + "\"" + "," + "\"" + favorite_count + "\"" + "," + "\"" + followers_count + "\"" \
                    + "," + "\"" + friends_count + "\"" + "," + "\"" + date + "\"" + "," + "\"" + tweettime + "\""

                tweets.append(row)                       
        except Exception as e:
            #print(str(e))
            return ["no tweets", "Twitter Requests Limit Reached", time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(int(twitter.get_lastfunction_header('x-rate-limit-reset'))))]

    apicalllimit = twitter.get_lastfunction_header('x-rate-limit-remaining')
    apicallreset = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(int(twitter.get_lastfunction_header('x-rate-limit-reset'))))

    if saveToDB == "true":        
        tableName = filename + "_tweets_" + str(userID)
        connection.execute("DROP TABLE IF EXISTS `"+ tableName + "`")
        connection.execute("CREATE TABLE `" + tableName + "` (tweetid VARCHAR(255), userid VARCHAR(255), name VARCHAR(255), \
            tweet VARCHAR(255) COLLATE utf8_unicode_ci, retweet_count INT(255), favorite_count INT(255), followers_count INT(255), \
            friends_count INT(255), date date, tweettime VARCHAR(255));")
        
        connection.execute("DELETE FROM user_data WHERE data_name = '" + tableName + "'")
        timestamp = datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
        connection.execute("INSERT INTO user_data (data_name,user_id,upload_date) VALUES ( \"" + tableName + "\", " + str(userID) + ", \"" + str(timestamp) + "\");")
        status = insertToDatabase(headerArray, tweets, tableName)

        results = ["Successfully saved twitter data into the database", apicalllimit, apicallreset]        
        return results
    else:
        #write the data into a csv file
        returnStr = headerArray
        returnStr += "\n"
        for i in tweets:
            returnStr += i
            returnStr += "\n"            

        results = [returnStr, apicalllimit, apicallreset]
        return results   
  
def insertToDatabase(header, bodyArray, tableName):
    """
        This method will insert to database
    """    
    try:
        sqlstmt = "INSERT INTO `" + tableName + "` (" + header + ") VALUES"
        for i in bodyArray:
            sqlstmt += "("
            sqlstmt += i
            sqlstmt += "),"
        sqlstmt = sqlstmt[0:len(sqlstmt)-1]
        sqlstmt += ";"

        connection.execute(sqlstmt)
        return True
    except Exception as e:
        return False

def corpus2docs(corpus):
    """
        This method will preprocess the data
    """    
    stop_list = nltk.corpus.stopwords.words('english')
    stop_list += ['would', 'said', 'say', 'year', 'day', 'also', 'first', 'last', 'one', 'two', 'people', 'told', 'new', 'could', \
        'three', 'may', 'like', 'world', 'since', 'rt', 'http', 'https']
    
    wordnet_lemmatizer = WordNetLemmatizer()

    docs1 = []
    for tweet in corpus:
        doc = nltk.word_tokenize(tweet)
        docs1.append(doc)
    docs2 = [[w.lower() for w in doc] for doc in docs1] #lower case
    docs3 = [[w for w in doc if re.search('^[a-z]+$', w)] for doc in docs2] #keep only alphabets
    docs4 = [[w for w in doc if w not in stop_list] for doc in docs3] #remove stopwords
    docs5 = [[wordnet_lemmatizer.lemmatize(w) for w in doc] for doc in docs4] #lemmatize    
    docs6 = [[w for w in doc if len(w) >= 2] for doc in docs5] #remove single letters

    #remove common words - can become noise
    freqarray = []
    for tweet in docs6:
        for w in tweet:
            freqarray.append(w)
    
    fdist = nltk.FreqDist(freqarray)
    mostcommon = fdist.most_common(2)
    freq = []
    for tuples in mostcommon:
        freq.append(tuples[0])

    docs7 = [[w for w in doc if w not in freq] for doc in docs6] #remove top 2 words
    
    return docs7

def docs2vecs(docs, dictionary):
    """
        This method convert documents to vectors
    """
    # docs is a list of documents returned by corpus2docs.
    # dictionary is a gensim.corpora.Dictionary object.
    vecs = [dictionary.doc2bow(doc) for doc in docs]
    return vecs

def format_topics_sentences(ldamodel, corpus, data):
    """
        This method will find the most dominant topic
    """    
    # Init output
    sent_topics_df = pd.DataFrame()

    # Get main topic in each document
    for i, row in enumerate(ldamodel[corpus]):
        row = sorted(row[0], key=lambda x: (x[1]), reverse=True)
        # Get the Dominant topic, Perc Contribution and Keywords for each document
        for j, (topic_num, prop_topic) in enumerate(row):
            if j == 0:  # => dominant topic
                wp = ldamodel.show_topic(topic_num)
                topic_keywords = ", ".join([word for word, prop in wp])
                sent_topics_df = sent_topics_df.append(pd.Series([int(topic_num), round(prop_topic,4), topic_keywords]), ignore_index=True)
            else:
                break
    sent_topics_df.columns = ['Dominant_Topic', 'Perc_Contribution', 'Topic_Keywords']

    # Add original text to the end of the output
    contents = pd.Series(data)
    sent_topics_df = pd.concat([sent_topics_df, contents], axis=1)
    return (sent_topics_df)

def topicModeling(tablename, usertablename, userID):
    """
        This method will implement best topic modeling model
    """   
    try:
        # Load unseen testing dataset 
        sqlstmtQuery = "SELECT * FROM `" + usertablename + "`"

        df = pd.read_sql(sqlstmtQuery, connection) # Change sql to dataframe

    # Creating the object for LDA model using gensim library
    # Lda = gensim.models.ldamodel.LdaModel

    #Running and Trainign LDA model on the document term matrix.
    # ldamodel = Lda(doc_term_matrix, num_topics=3, id2word = dictionary, passes=50)

    # print(ldamodel.print_topics(num_topics=3, num_words=3))[0.168*health + 0.083*sugar + 0.072*bad,0.061*consume + 0.050*drive + 0.050*sister,0.049*pressur + 0.049*father + 0.049*sister]

        copydf = df.copy()

        tweetColumnName = 'tweet'
        nooftopics = 5

        # Preprocess the text
        tweets_docs = corpus2docs(df[tweetColumnName].tolist())

        # Generate a vocabulary of text
        tweets_dictionary = gensim.corpora.Dictionary(tweets_docs)

        # Convert text into vectors
        tweets_vecs = docs2vecs(tweets_docs, tweets_dictionary)        

        # Train lda model with the unseen test dataset
        lda = gensim.models.ldamodel.LdaModel(corpus=tweets_vecs, 
                                              id2word=tweets_dictionary,
                                              num_topics=nooftopics,  
                                              random_state=0,
                                              update_every=1,
                                              chunksize=100,
                                              passes=10,
                                              alpha='auto',
                                              per_word_topics=True)
        """
        # Compute Perplexity
        print('\nPerplexity: ', lda.log_perplexity(tweets_vecs)) # a measure of how good the model is. lower the better.

        # Compute Coherence Score
        coherence_model_lda = CoherenceModel(model=lda, texts=tweets_docs, dictionary=tweets_dictionary, coherence='c_v')
        coherence_lda = coherence_model_lda.get_coherence()
        print('\nCoherence Score: ', coherence_lda)      
        """

        # Format
        df_topic_sents_keywords = format_topics_sentences(ldamodel=lda, corpus=tweets_vecs, data=tweets_docs)

        """
        df_dominant_topic = df_topic_sents_keywords.reset_index()
        df_dominant_topic.columns = ['Document_No', 'Dominant_Topic', 'Topic_Perc_Contrib', 'Keywords', 'Text']
        """

        # Group top 5 sentences under each topic
        sent_topics_sorteddf_mallet = pd.DataFrame()

        sent_topics_outdf_grpd = df_topic_sents_keywords.groupby('Dominant_Topic')

        for i, grp in sent_topics_outdf_grpd:
            sent_topics_sorteddf_mallet = pd.concat([sent_topics_sorteddf_mallet, 
                                                     grp.sort_values(['Perc_Contribution'], ascending=[0]).head(1)], 
                                                    axis=0)

        # Reset Index    
        sent_topics_sorteddf_mallet.reset_index(drop=True, inplace=True)

        # Format
        sent_topics_sorteddf_mallet.columns = ['Topics', "Topic Percent Contribution", "Keywords", "Most Representative Tweet"]

        sent_topics_sorteddf_mallet = sent_topics_sorteddf_mallet[['Topics', "Keywords"]]

        topiccolumns = sent_topics_sorteddf_mallet.columns.tolist()
        topicvalues = sent_topics_sorteddf_mallet.values.tolist()

        return [topiccolumns, topicvalues]
    except Exception as e:
        print(str(e))
        return "Something is wrong with sentimentAnalysis method"  

def sentimentAnalysis(tablename, usertablename, userID):
    """
        This method will implement best sentiment analysis model
    """    
    # Load the trained model
    classifier_saved = open("sentimentanalysis.pickle", "rb") #binary read
    classifier_load = pickle.load(classifier_saved)
    classifier_saved.close()
    
    # Sentiment Analysis
    tweetColumnName = 'tweet'
    isTrainData = False

    try:
        # Load unseen testing dataset 
        sqlstmtQuery = "SELECT * FROM `" + usertablename + "`"

        testdf = pd.read_sql(sqlstmtQuery, connection) # Change sql to dataframe

        copytestdf = testdf.copy()

        # Preprocess the text
        stringOfTokenizedTweets = preprocessingDataset(testdf, tweetColumnName, isTrainData)

        # Classify the unseen test dataset with the train model
        test_predicted = classifier_load.predict(stringOfTokenizedTweets)

        # Get probability of labeling sentiment
        predictionprobability = classifier_load.predict_proba(stringOfTokenizedTweets)[:,1]

        # Adding probability to dataframe       
        copytestdf['sentiment_score'] = predictionprobability 

        # Adding predicted sentiment to dataframe
        copytestdf['sentiment'] = test_predicted 

        tableName = tablename + "_w_sentiment_" + str(userID)
        connection.execute("DROP TABLE IF EXISTS `" + tableName + "`")
        connection.execute("CREATE TABLE `" + tableName + "` (tweetid VARCHAR(255), userid VARCHAR(255), name VARCHAR(255), \
            tweet VARCHAR(255) COLLATE utf8_unicode_ci, retweet_count INT(255), favorite_count INT(255), followers_count INT(255), \
            friends_count INT(255), date date, tweettime VARCHAR(255), sentiment_score FLOAT(4,2), sentiment INT(255));")
        
        connection.execute("DELETE FROM user_data WHERE data_name = '" + tableName + "'")
        timestamp = datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
        connection.execute("INSERT INTO user_data (data_name,user_id,upload_date) VALUES ( \"" + tableName + "\", " + str(userID) + ", \"" + str(timestamp) + "\");")

        copytestdf.to_sql(name=tableName, con=engine, if_exists = 'append', index=False, chunksize=1000, \
            dtype={'tweetid': sqlalchemy.types.VARCHAR(), 'userid': sqlalchemy.types.VARCHAR(), 'name': sqlalchemy.types.VARCHAR(), \
            'tweet': sqlalchemy.types.VARCHAR(), 'retweet_count': sqlalchemy.types.INTEGER(), \
            'favorite_count': sqlalchemy.types.INTEGER(), 'followers_count': sqlalchemy.types.INTEGER(), \
            'friends_count': sqlalchemy.types.INTEGER(), 'date': sqlalchemy.DateTime(), 'tweettime': sqlalchemy.types.VARCHAR(), \
            'sentiment_score': sqlalchemy.types.FLOAT(), 'sentiment': sqlalchemy.types.INTEGER()})

        return tableName
    except Exception as e:
        return "Something is wrong with sentimentAnalysis method"  

def preprocessingDataset(df, tweetColumnName, isTrainData):
    """
    This method will pre-process the dataset
    """

    # Tokenize each tweet and save into data frame
    listOfTokenizedTweets = []
    for x in df[tweetColumnName]:
        tokenized_word = word_tokenize(x)
        listOfTokenizedTweets.append(tokenized_word)
    df[tweetColumnName] = listOfTokenizedTweets

    # Change all to lowercase letters
    df[tweetColumnName] = df[tweetColumnName].apply(lambda x: [y.lower() for y in x])

    # Remove punctuation
    df[tweetColumnName] = df[tweetColumnName].apply(lambda x: [y for y in x if re.search('^[a-z]+$', y)])
    """
    # Remove stopwords
    stop = stopwords.words('english')
    df[tweetColumnName] = df[tweetColumnName].apply(lambda x: [y for y in x if y not in stop])
    """
    # Stemming each tweet
    stemmer = PorterStemmer()
    df[tweetColumnName] = df[tweetColumnName].apply(lambda x: [stemmer.stem(y) for y in x])
    """
    if isTrainData:
        # Remove uncommon words - can become noise
        freq = pd.Series(' '.join(df[tweetColumnName]).split()).value_counts()[-10:]
        freq = list(freq.index)
        df[tweetColumnName] = df[tweetColumnName].apply(lambda x: [y for y in x if y not in freq])
    """
    # Convert processed tweets from data frame to a list
    processedTweets = df[tweetColumnName].tolist()

    # Rejoin the tokenize words into a sentence after preprocessing as count vectorizer need it to be a string
    stringOfTokenizedTweets = []
    for x in processedTweets:
        sentenceTweet = (' '.join(x))
        stringOfTokenizedTweets.append(sentenceTweet)

    return stringOfTokenizedTweets

def trainSentimentAnalysisModels():
    """
    This method split datas set into train and test (70%:30%), and save to dictionary.pickle, train the model and validate the model
    """    
    df = pd.read_csv(os.getcwd()+'/train.csv', encoding = "ISO-8859-1")

    labelColumnName = 'Sentiment'
    tweetColumnName = 'SentimentText'
    isTrainData = True

    # Convert the labellings in data frame to a list
    listOfLabels = df[labelColumnName].tolist()

    # Preprocess the text
    stringOfTokenizedTweets = preprocessingDataset(df, tweetColumnName, isTrainData)

    # Generate document term matrix - bag of words
    vectorizer = CountVectorizer()
    
    """
    Set up training and test sets by choosing random samples from classes, 
    x_train is the training data set, y_train is the x_train labels, 
    x_test is the testing data set and y_test is the training labels
    """
    X_train, X_test, y_train, y_test = train_test_split(stringOfTokenizedTweets, listOfLabels, test_size=0.30, random_state=0)

    # K fold cross validation
    text_clf = Pipeline([('vect', vectorizer),
                         ('tfidf', TfidfTransformer()),
                         ('clf', MultinomialNB())])

    tuned_parameters = {
        'vect__ngram_range': [(1, 1), (1, 2), (2, 2)],
        'tfidf__use_idf': (True, False),
        'tfidf__norm': ('l1', 'l2'),
        'clf__alpha': [1, 1e-1, 1e-2]
    }

    scores = 'f1'

    # Model Generation Using Multinomial Naive Bayes
    clf = GridSearchCV(text_clf, tuned_parameters, cv=2, scoring=scores)
    clf.fit(X_train, y_train)

    # Accuracy calculation
    print(classification_report(y_test, clf.predict(X_test), digits=4))

    # Best hyperparameters to use for model
    print(clf.best_params_)

    # Fit full data into model
    X_train, X_test, y_train, y_test = train_test_split(stringOfTokenizedTweets, listOfLabels, test_size=0, random_state=0)
    clf.fit(X_train, y_train)

    # Save model into file
    pickle.dump(clf, open(os.getcwd()+'/sentimentanalysis.pickle', "wb")) #binary write

    return ""

def sentimentResultAnalysis(tablename, tablename2):
    positivesentiment = connection.execute("SELECT date, COUNT(*) FROM `" +  tablename +"` GROUP BY date,sentiment HAVING sentiment=1");
    negativesentiment = connection.execute("SELECT date, COUNT(*) FROM `" +  tablename +"` GROUP BY date,sentiment HAVING sentiment=0");
    allcounts = connection.execute("SELECT date,SUM(retweet_count) as 'retweet_count',SUM(favorite_count) as 'favorite_count',SUM(followers_count) as 'followers_count',SUM(friends_count) as 'friends_count' FROM `dhltwt_tweets_w_sentiment_4` GROUP BY date");
    variablesSecond = getNumericalColumnNamebi(tablename2);
    selectstmt = str(str(variablesSecond).replace("'",""))[1:-1]
    
    secondTable = connection.execute("SELECT ActivityDate," + selectstmt + " FROM " + tablename2)
    allPairs = {}
    allPairs2 = {}
    for result in allcounts:
        currentKey = ""
        subpair = {}
        for x,y in result.items():
            if (x=="date"):
                currentKey = str(y)
            else:
                subpair[x] = int(str(y))
        allPairs[currentKey] = subpair
    for result in secondTable:
        currentKey = ""
        subpair = {}
        for x,y in result.items():
            
            if (x.lower() == "date" or x.lower() == "activitydate"):
                currentKey = str(y)
            else:
                subpair[x] = int(str(y))
        allPairs2[currentKey] = subpair
    for result in positivesentiment:
        currentKey = ""
        valy = ""
        for x,y in result.items():
            if(x=="date"):
                currentKey = str(y)
            else:
                valy = int(str(y))
        currentSubPairs = allPairs[currentKey]
        currentSubPairs["positive_sentiment"] = valy
        allPairs[currentKey] = currentSubPairs
    for result in negativesentiment:
        currentKey = ""
        valy = ""
        for x,y in result.items():
            if(x=="date"):
                currentKey = str(y)
            else:
                valy = int(str(y))
        currentSubPairs = allPairs[currentKey]
        currentSubPairs["negative_sentiment"] = valy
        allPairs[currentKey] = currentSubPairs
    
    return allPairs,allPairs2
