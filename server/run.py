from app import *

config_name = os.getenv('FLASK_CONFIG')
app = create_app(config_name)

if __name__ == '__main__': #this will run only if you run from this file
    app.run(debug = True)