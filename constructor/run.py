# coding=utf-8
from flask import Flask, request
from construct_calendar import construct_calendar
import json
import sys
import base64

app = Flask(__name__)


@app.route('/', methods=['POST'])
def index():
    course_configuration = json.loads(base64.b64decode(
        request.form['data']).decode('utf-8'))
    calendar_content = construct_calendar(
        course_configuration['courses'], course_configuration['conf'])
    return str(base64.b64encode(calendar_content), encoding='utf-8')


if __name__ == '__main__':
    app.run(
        host = '127.0.0.1',
        port = 34600,
        debug = False
    )
