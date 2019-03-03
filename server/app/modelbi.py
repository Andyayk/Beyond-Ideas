"""
@author: Beyond Ideas 
"""

import mysql.connector, datetime, requests, json, csv, os, time, io, math, random, operator, re
import pandas as pd
import numpy as np
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem.porter import *
from sklearn.model_selection import train_test_split
from twython import Twython
from io import StringIO
from sqlalchemy import create_engine
from sqlalchemy.sql import text
engine = create_engine('mysql://root:@localhost/is480-term1-2018-19')

#MySQL Configurations
# mydb = mysql.connector.connect(
  # host = "localhost",
  # user = "root",
  # passwd = "",
  # database = "is480-term1-2018-19"
# )
# cursor = mydb.cursor(buffered=True)  

  
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
        resultQuery = text("SELECT * FROM `" + table_name + "` LIMIT 20")
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
            
        sqlstmt = connection.execute(sqlstmtQuery)
        sqlstmt = connection.execute(sqlstmtQuery)
        x = []
        y = []

          
        
        for row_data in sqlstmt: #add table rows
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

def tablesViewJoinbi(variables, tablename, tablename2, joinvariable, combinedtablename):
    """
        This method will join two tables together and save to MySQL database
    """
    try:
        connection.execute("DROP TABLE IF EXISTS "+ combinedtablename)
        sqlstmt = "CREATE TABLE "+ combinedtablename + " AS SELECT "+ variables + " FROM `" + tablename + "` as t1 INNER JOIN `" + tablename2 + "` as t2"
        
        if "date" in joinvariable.lower(): #join by date
            date1 = getDateColumnNamebi(tablename)
            date2 = getDateColumnNamebi(tablename2)
           
            sqlstmt = sqlstmt + " WHERE t1." + date1[0] + " = t2." + date2[0]
        else:
            sqlstmt = sqlstmt + " WHERE t1." + joinvariable + " = t2." + joinvariable
        connection.execute(sqlstmt)

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
        This method will get selected variables data (varchar variables column names only)
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
            connection.execute("CREATE TABLE `" + tableName + "` (date date, meanTemperatureC int(2), meanTemperatureF int(2));")
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

def twitterCrawlerbi(tags, nooftweets, saveToDB, userID, filename):
    """
        This method crawl data from Twitter
    """
    #load credentials from json file        
    with open(os.getcwd()+"\\instance\\twitter_credentials.json", "r") as file:  
        creds = json.load(file)

    #instantiate an object
    twitter = Twython(creds['CONSUMER_KEY'], creds['CONSUMER_SECRET'])
    
    searchQuery = tags
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
        'count': tweetsPerQuery
    }

    headerArray = "tweetid,userid,name,tweet,date"

    while tweetCount < maxTweets:
        if max_id <= 0: #first
            if not sinceId: #do normal query first
                query = {
                    'q': searchQuery, 
                    'lang': 'en',
                    'count': tweetsPerQuery
                }
            else:
                query = {
                    'q': searchQuery, 
                    'lang': 'en',
                    'count': tweetsPerQuery,
                    'since_id': sinceId
                }                    
        else:
            if not sinceId:
                query = {
                    'q': searchQuery, 
                    'lang': 'en',
                    'count': tweetsPerQuery,
                    'max_id': str(max_id - 1)
                }                    
            else:
                query = {
                    'q': searchQuery, 
                    'lang': 'en',
                    'count': tweetsPerQuery,
                    'max_id': str(max_id - 1),
                    'since_id': sinceId                        
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
                date = dateformatted

                row = tweetid + "," + userid + "," + "\"" + name + "\"" + "," + "\"" + tweet + "\"" + "," + "\"" + date + "\""

                tweets.append(row)                       
        except Exception as e:
            #print(str(e))
            return ["no tweets", "Twitter Requests Limit Reached", time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(int(twitter.get_lastfunction_header('x-rate-limit-reset'))))]

    apicalllimit = twitter.get_lastfunction_header('x-rate-limit-remaining')
    apicallreset = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(int(twitter.get_lastfunction_header('x-rate-limit-reset'))))

    if saveToDB == "true":        
        tableName = filename + "_" + str(userID)
        connection.execute("CREATE TABLE `" + tableName + "` (tweetid BIGINT(255), userid BIGINT(255), name VARCHAR(255), tweet VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci, date date);")
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
  
def naiveBayesClassifier():
    """
        This method will implement naive bayes classifier
    """    
    """
    filename = 'diabetes.csv'
    splitRatio = 0.67 #how we are splitting our train and test data set
    dataset = []
    with open(os.getcwd()+"\\"+filename, mode='r', newline='') as new_file: #loading our dataset
        csv_reader = csv.reader(new_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                line_count += 1
            else:
                dataset.append([float(x) for x in row])
                line_count += 1

    trainSet, testSet = splitDataset(dataset, splitRatio)
    """
    #training label
    train_label = open('20news-bydate/matlab/train.label')

    #contains p(class), where p(class) = no. of class-1 documents / total number of documents
    pclasses = {}

    #set a class index for each document as key
    for i in range(1,21):
        pclasses[i] = 0
        
    #extract values from training labels
    rows = train_label.readlines()

    #count total number of documents available
    total = len(rows)

    #count the total documents of each class
    for row in rows:
        val = int(row.split()[0])
        pclasses[val] += 1

    #calculate p(class) here, dividing the count of each class by total documents 
    for key in pclasses:
        pclasses[key] /= total
        
    print("Probability of each class:")
    print("\n".join("{}: {}".format(k, v) for k, v in pclasses.items()))

    #training data
    train_data = open('20news-bydate/matlab/train.data')
    df = pd.read_csv(train_data, delimiter=' ', names=['docId', 'wordId', 'count'])

    #training label
    label = []

    for row in rows:
        label.append(int(row.split()[0]))

    #increase label length to match docId
    docId = df['docId'].values
    i = 0
    new_label = []
    for index in range(len(docId)-1):
        new_label.append(label[i])
        if docId[index] != docId[index+1]:
            i += 1
    new_label.append(label[i]) #for-loop ignores last value

    #add label column
    df['classId'] = new_label

    print(df.head())

    #alpha value for smoothing - some words may have 0 values, 
    #to avoid giving a zero probability to a word under any class during training, 
    #we can perform some smoothing of the learned probabilities
    #simply add one count to each word under each class
    a = 0.001
    wordsInVocabulary = 16688

    #calculate probability of each word based on class
    p_ij = df.groupby(['classId','wordId'])
    p_j = df.groupby(['classId'])
    Pr =  (p_ij['count'].sum() + a) / (p_j['count'].sum() + wordsInVocabulary + 1)    

    #unstack series
    Pr = Pr.unstack()

    #replace NaN or columns with 0 as word count with a/(count+|V|+1)
    for c in range(1,21):
        Pr.loc[c,:] = Pr.loc[c,:].fillna(a/(p_j['count'].sum()[c] + wordsInVocabulary + 1))

    #convert to dictionary for greater speed
    Pr_dict = Pr.to_dict()

    print(Pr)

    #common stop words from online
    stop_words = [
    "a", "about", "above", "across", "after", "afterwards", 
    "again", "all", "almost", "alone", "along", "already", "also",    
    "although", "always", "am", "among", "amongst", "amoungst", "amount", "an", "and", "another", "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are", "as", "at", "be", "became", "because", "become","becomes", "becoming", "been", "before", "behind", "being", "beside", "besides", "between", "beyond", "both", "but", "by","can", "cannot", "cant", "could", "couldnt", "de", "describe", "do", "done", "each", "eg", "either", "else", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "find","for","found", "four", "from", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "i", "ie", "if", "in", "indeed", "is", "it", "its", "itself", "keep", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mine", "more", "moreover", "most", "mostly", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next","no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own", "part","perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "she", "should","since", "sincere","so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "take","than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they",
    "this", "those", "though", "through", "throughout",
    "thru", "thus", "to", "together", "too", "toward", "towards",
    "under", "until", "up", "upon", "us",
    "very", "was", "we", "well", "were", "what", "whatever", "when",
    "whence", "whenever", "where", "whereafter", "whereas", "whereby",
    "wherein", "whereupon", "wherever", "whether", "which", "while", 
    "who", "whoever", "whom", "whose", "why", "will", "with",
    "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves"
    ]    
    
    #create vocabulary dataframe
    vocab = open('20news-bydate/matlab/vocabulary.txt') 
    vocab_df = pd.read_csv(vocab, names = ['word']) 
    vocab_df = vocab_df.reset_index() 
    vocab_df['index'] = vocab_df['index'].apply(lambda x: x+1) 
    print(vocab_df.head())

    #index of all words
    tot_list = set(vocab_df['index'])

    #index of good words
    vocab_df = vocab_df[~vocab_df['word'].isin(stop_words)]
    good_list = vocab_df['index'].tolist()
    good_list = set(good_list)

    #index of stop words
    bad_list = tot_list - good_list

    #set all stop words to 0
    for bad in bad_list:
        for j in range(1,21):
            Pr_dict[j][bad] = a/(p_j['count'].sum()[j] + wordsInVocabulary + 1)

    #calculate IDF 
    tot = len(df['docId'].unique()) 
    p_ij = df.groupby(['wordId']) 
    IDF = np.log(tot/p_ij['docId'].count()) 
    IDF_dict = IDF.to_dict()

    regular_predict = MNB(df, pclasses, smooth=False, IDF=False)
    smooth_predict  = MNB(df, pclasses, smooth=True, IDF=False)
    tfidf_predict   = MNB(df, pclasses, smooth=False, IDF=True)
    all_predict     = MNB(df, pclasses, smooth=True, IDF=True)
    #Get list of labels
    train_label = pd.read_csv('20news-bydate/matlab/train.label',
                              names=['t'])
    train_label= train_label['t'].tolist()
    total = len(train_label) 
    models = [regular_predict, smooth_predict, 
              tfidf_predict, all_predict] 
    strings = ['Regular', 'Smooth', 'IDF', 'Both'] 
     
    for m,s in zip(models,strings):
        val = 0
        for i,j in zip(m, train_label):
            if i != j:
                val +=1
            else:
                pass   
        print(s,"Error:\t\t",val/total * 100, "%")    

    #Get test data
    test_data = open('20news-bydate/matlab/test.data')
    df = pd.read_csv(test_data, delimiter=' ', names=['docId', 'wordId', 'count'])

    #Get list of labels
    test_label = pd.read_csv('20news-bydate/matlab/test.label', names=['t'])
    test_label= test_label['t'].tolist()

    #MNB Calculation
    predict = MNB(df, pclasses, smooth = True, IDF = False)

    total = len(test_label)
    val = 0
    for i,j in zip(predict, test_label):
        if i == j:
            val +=1
        else:
            pass
    print("Error:\t",(1-(val/total)) * 100, "%")        

def MNB(df, pclasses, smooth = False, IDF = False):
    '''
    Multinomial Naive Bayes classifier
    :param df [Pandas Dataframe]: Dataframe of data
    :param smooth [bool]: Apply Smoothing if True
    :param IDF [bool]: Apply Inverse Document Frequency if True
    :return predict [list]: Predicted class ID
    '''
    #Using dictionaries for greater speed
    df_dict = df.to_dict()
    new_dict = {}
    prediction = []
    
    #new_dict = {docId : {wordId: count},....}
    for index in range(len(df_dict['docId'])):
        docId = df_dict['docId'][index]
        wordId = df_dict['wordId'][index]
        count = df_dict['count'][index]
        try: 
            new_dict[docId][wordId] = count 
        except:
            new_dict[df_dict['docId'][index]] = {}
            new_dict[docId][wordId] = count

    #Calculating the scores for each doc
    for docId in range(1, len(new_dict)+1):
        score_dict = {}
        #Creating a probability row for each class
        for classId in range(1,21):
            score_dict[classId] = 1
            #For each word:
            for wordId in new_dict[docId]:
                #Check for frequency smoothing
                #log(1+f)*log(Pr(i|j))
                if smooth: 
                    try:
                        probability=Pr_dict[wordId][classId]         
                        power = np.log(1+ new_dict[docId][wordId])     
                        #Check for IDF
                        if IDF:
                            score_dict[classId]+=(
                               power*np.log(
                               probability*IDF_dict[wordId]))
                        else:
                            score_dict[classId]+=power*np.log(
                                                   probability)
                    except:
                        #Missing V will have log(1+0)*log(a/16689)=0 
                        score_dict[classId] += 0                        
                #f*log(Pr(i|j))
                else: 
                    try:
                        probability = Pr_dict[wordId][classId]        
                        power = new_dict[docId][wordId]               
                        score_dict[classId]+=power*np.log(
                                           probability) 
                        #Check for IDF
                        if IDF:
                            score_dict[classId]+= power*np.log(
                                   probability*IDF_dict[wordId]) 
                    except:
                        #Missing V will have 0*log(a/16689) = 0
                        score_dict[classId] += 0      
            #Multiply final with pclasses         
            score_dict[classId] +=  np.log(pclasses[classId])                          

        #Get class with max probabilty for the given docId 
        max_score = max(score_dict, key=score_dict.get)
        prediction.append(max_score)
        
    return prediction

def splitDataset(dataset, splitRatio):
    """
        This method will split our dataset into train and test according to split ratio
    """      
    trainSetSize = int(len(dataset) * splitRatio)
    trainSet = []

    testSet = list(dataset)
    while len(trainSet) < trainSetSize:
        index = random.randrange(len(testSet))
        trainSet.append(testSet.pop(index))
    return [trainSet, testSet]
 
 """
 This method will pre-process the training dataset and split int into train and test (70:30)
 def preprocessingDataset():
  
    df = pd.read_csv('train.csv', encoding = "ISO-8859-1")

    #change all to lowercase letters 
    df['SentimentText'] = df['SentimentText'].apply(lambda x: " ".join(x.lower() for x in x.split()))

    #remove punctuation 
    df['SentimentText'] = df['SentimentText'].str.replace('[^\w\s]','')

    #remove stopwords
    stop = stopwords.words('english')
    df['SentimentText'] = df['SentimentText'].apply(lambda x: " ".join(x for x in x.split() if x not in stop))
             
    #tokenize each tweet and save into dataframe
    listOfTokenizedTweets = []
    for x in df['SentimentText']:
        tokenized_word = word_tokenize(x)
        listOfTokenizedTweets.append(tokenized_word)
    df['SentimentText'] = listOfTokenizedTweets

    #stemming each tweet
    stemmer = PorterStemmer()
    df['SentimentText'] = df['SentimentText'].apply(lambda x: [stemmer.stem(y) for y in x])    

    # Set up training and test sets by choosing random samples from classes
    X_train, X_test, y_train, y_test = train_test_split(df['Sentiment'], df['SentimentText'], test_size=0.30, random_state=0)

    df_train = pd.DataFrame()
    df_test = pd.DataFrame()

    df_train['Sentiment'] = X_train
    df_train['SentimentText'] = y_train
    df_train = df_train.reset_index(drop=True)

    df_test['Sentiment'] = X_test
    df_test['SentimentText'] = y_test
    df_test = df_test.reset_index(drop=True)

    print(df_train)
    print('testing')
    print(df_test)

    #split by sentiment 
    #get all the words 
    """