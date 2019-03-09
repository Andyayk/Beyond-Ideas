"""
@author: Beyond Ideas 
"""

import mysql.connector, datetime, requests, json, csv, os, time, io, math, random, operator, re
import pandas as pd
import numpy as np
import pickle
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem.porter import *
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
        tableName = filename + "_" + str(userID)
        connection.execute("DROP TABLE IF EXISTS `"+ tableName + "`")
        connection.execute("CREATE TABLE `" + tableName + "` (tweetid BIGINT(255), userid BIGINT(255), name VARCHAR(255), tweet VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci, retweet_count INT(255), favorite_count INT(255), followers_count INT(255), friends_count INT(255), date date, tweettime VARCHAR(255));")
        
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
  
def naiveBayesClassifier(data):
    """
        This method will implement naive bayes classifier
    """    
    #load dictionary
    #loaded_vec = pickle.load(open(os.getcwd()+'/dictionary.pickle', "rb"))

    classifier_saved = open("naivebayes.pickle", "rb") #binary read
    classifier_load = pickle.load(classifier_saved)
    classifier_saved.close()

    tweetColumnName = 'SentimentText'
    isTrainData = False

    # Load unseen testing dataset 
    testdf = pd.read_csv(data, encoding="ISO-8859-1")

    # Preprocess the text
    stringOfTokenizedTweets = preprocessingDataset(testdf, tweetColumnName, isTrainData)

    # Generate document term matrix for unseen training set - bag of words
    #dt_sentimentText = loaded_vec.transform(stringOfTokenizedTweets)

    # Classify the unseen test dataset with the train model
    Test_predicted = classifier_load.predict(stringOfTokenizedTweets)
    print(Test_predicted)

    return ""
 
def preprocessingDataset(df, tweetColumnName, isTrainData):
    """
    This method will pre-process the dataset
    """

    # Change all to lowercase letters
    df[tweetColumnName] = df[tweetColumnName].apply(lambda x: " ".join(x.lower() for x in x.split()))

    # Remove punctuation
    df[tweetColumnName] = df[tweetColumnName].str.replace('[^\w\s]', '')

    # Remove stopwords
    stop = stopwords.words('english')
    df[tweetColumnName] = df[tweetColumnName].apply(lambda x: " ".join(x for x in x.split() if x not in stop))

    if isTrainData:
        # Remove uncommon words - can become noise
        freq = pd.Series(' '.join(df[tweetColumnName]).split()).value_counts()[-10:]
        freq = list(freq.index)
        df[tweetColumnName] = df[tweetColumnName].apply(lambda x: " ".join(x for x in x.split() if x not in freq))

    # Tokenize each tweet and save into data frame
    listOfTokenizedTweets = []
    for x in df[tweetColumnName]:
        tokenized_word = word_tokenize(x)
        listOfTokenizedTweets.append(tokenized_word)
    df[tweetColumnName] = listOfTokenizedTweets

    # Stemming each tweet
    stemmer = PorterStemmer()
    df[tweetColumnName] = df[tweetColumnName].apply(lambda x: [stemmer.stem(y) for y in x])

    # Convert stemmed tweets from data frame to a list
    listOfStemmedTweets = df[tweetColumnName].tolist()

    # Rejoin the tokenize words into a sentence after stemming as count vectorizer need it to be a string
    stringOfTokenizedTweets = []
    for x in listOfStemmedTweets:
        sentenceTweet = (' '.join(x))
        stringOfTokenizedTweets.append(sentenceTweet)

    return stringOfTokenizedTweets

def trainModels():
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
    dt_sentimentText = vectorizer.fit_transform(stringOfTokenizedTweets)
    
    """
    Set up training and test sets by choosing random samples from classes, 
    x_train is the training data set, y_train is the x_train labels, 
    x_test is the testing data set and y_test is the training labels
    """
    X_train, X_test, y_train, y_test = train_test_split(stringOfTokenizedTweets, listOfLabels, test_size=0.30, random_state=0)

    # Model Generation Using Multinomial Naive Bayes
    #clf = MultinomialNB().fit(X_train, y_train)
    #print(X_test)
    #predicted = clf.predict(X_test)

    # Accuracy calculation
    #print("Pre-MultinomialNB Accuracy:", metrics.accuracy_score(y_test, predicted))

    # K fold cross validation
    text_clf = Pipeline([('vect', vectorizer),
                         ('tfidf', TfidfTransformer()),
                         ('clf', MultinomialNB())])
    tuned_parameters = {
        'vect__ngram_range': [(1, 1), (1, 2)],
        'tfidf__use_idf': (True, False),
        'tfidf__norm': ('l1', 'l2'),
        'clf__alpha': [1, 1e-1, 1e-2]
    }

    clf = GridSearchCV(text_clf, tuned_parameters, cv=2, scoring='f1')
    clf.fit(X_train, y_train)

    print(classification_report(y_test, clf.predict(X_test), digits=4))

    # Save vectorizer into dictionary file
    #pickle.dump(vectorizer, open("dictionary.pickle", "wb")) #binary write

    # Save model into file
    pickle.dump(clf, open(os.getcwd()+'/naivebayes.pickle', "wb")) #binary write

    return ""


