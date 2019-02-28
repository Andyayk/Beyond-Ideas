"""
@author: Beyond Ideas 
"""

import mysql.connector, datetime, requests, json, csv, os, time, io, math, random
import pandas as pd

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
 
def csv2string(data):
    """
        This method will turn csv into string
    """     
    si = StringIO()
    cw = csv.writer(si)
    cw.writerow(data)
    return si.getvalue()

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

def tablesViewJoinbi(variables, tablename, tablename2, joinvariable):
    """
        This method will join two tables together and save to MySQL database
    """
    try:
        connection.execute("DROP TABLE IF EXISTS combinedtable")
        sqlstmt = "CREATE TABLE combinedtable AS SELECT "+ variables + " FROM `" + tablename + "` as t1 INNER JOIN `" + tablename2 + "` as t2"
        
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

def weatherCrawlerbi(startdate, enddate, countryname, saveToDB, userID):
    """
        This method crawl weather data from worldweatheronline
    """ 
    print("line 315")
    print(saveToDB)
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
            tableName = "weather_data_" + country_name + "_" + input_start_date[8:10] + input_start_date[5:7] + input_start_date[0:4] + "_" + input_end_date[8:10] + input_end_date[5:7] + input_end_date[0:4]
            connection.execute("CREATE TABLE " + tableName + " (date date, meanTemperatureC int(2), meanTemperatureF int(2));")
            timestamp = datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
            connection.execute("INSERT INTO user_data (data_name,user_id,upload_date) VALUES ( \"" + tableName + "\", " + str(userID) + ", \"" + str(timestamp) + "\");")
            status = insertToDatabase(headerArray, bodyArray, tableName)
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
        return "Crawling of weather data unsuccessful."           

def twitterCrawlerbi(tags, nooftweets):
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
                tweet = []

                tweet.append(result['id'])
                tweet.append(result['user']['id'])
                tweet.append(result['user']['name'])
                tweet.append(result['text'])
                tweet.append(dateformatted)                                                                
                
                row = csv2string(tweet)

                tweets.append(row)                       
        except Exception as e:
            #print(str(e))
            #write the data into a csv file
            returnStr = headerArray
            returnStr += "\n"
            for i in tweets:
                returnStr += i     
                       
            return [returnStr, "Twitter Requests Limit Reached", time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(int(twitter.get_lastfunction_header('x-rate-limit-reset'))))]

    apicalllimit = twitter.get_lastfunction_header('x-rate-limit-remaining')
    apicallreset = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(int(twitter.get_lastfunction_header('x-rate-limit-reset'))))

    #write the data into a csv file
    returnStr = headerArray
    returnStr += "\n"
    for i in tweets:
        returnStr += i

    results = [returnStr, apicalllimit, apicallreset]
    return results  
  
def insertToDatabase(header, bodyArray, tableName):
    try:
        sqlstmt = "INSERT INTO " + tableName + " (" + header + ") VALUES"
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
    
    #preparing model
    separated = separateByClass(trainSet)
    summaries = {}
    for classValue, instances in separated.items():
        summaries[classValue] = summarize(instances)

    #test model
    predictions = getPredictions(summaries, testSet)
    accuracy = getAccuracy(testSet, predictions)

    for idx, val in enumerate(testSet):
        print(testSet[idx]) 
        print(" predict ") 
        print(predictions[idx])

    print(accuracy)
 
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
 
def separateByClass(dataset):
    separated = {}
    for i in range(len(dataset)):
        vector = dataset[i]
        if (vector[-1] not in separated):
            separated[vector[-1]] = []
        separated[vector[-1]].append(vector)
    return separated
 
def mean(numbers):
    return sum(numbers)/float(len(numbers))
 
def stdev(numbers):
    avg = mean(numbers)
    variance = sum([pow(x-avg,2) for x in numbers])/float(len(numbers)-1)
    return math.sqrt(variance)
 
def summarize(dataset):
    summaries = [(mean(attribute), stdev(attribute)) for attribute in zip(*dataset)]
    del summaries[-1]
    return summaries
 
def calculateProbability(x, mean, stdev):
    exponent = math.exp(-(math.pow(x-mean,2)/(2*math.pow(stdev,2))))
    return (1 / (math.sqrt(2*math.pi) * stdev)) * exponent
 
def calculateClassProbabilities(summaries, inputVector):
    probabilities = {}
    for classValue, classSummaries in summaries.items():
        probabilities[classValue] = 1
        for i in range(len(classSummaries)):
            mean, stdev = classSummaries[i]
            x = inputVector[i]
            probabilities[classValue] *= calculateProbability(x, mean, stdev)
    return probabilities
            
def predict(summaries, inputVector):
    probabilities = calculateClassProbabilities(summaries, inputVector)
    bestLabel, bestProb = None, -1
    for classValue, probability in probabilities.items():
        if bestLabel is None or probability > bestProb:
            bestProb = probability
            bestLabel = classValue
    return bestLabel
 
def getPredictions(summaries, testSet):
    predictions = []
    for i in range(len(testSet)):
        result = predict(summaries, testSet[i])
        predictions.append(result)
    return predictions
 
def getAccuracy(testSet, predictions):
    correct = 0
    for i in range(len(testSet)):
        if testSet[i][-1] == predictions[i]:
            correct += 1
    return (correct/float(len(testSet))) * 100.0
