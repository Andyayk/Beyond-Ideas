import os

from app import *
# from app.views import *

config_name = os.getenv('FLASK_CONFIG')
app = create_app(config_name)
# UserClass(app)

if __name__ == '__main__': #this will run only if you run from this file
    app.run(debug = True)