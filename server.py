from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


@app.route("/")
def welcome():
  return render_template("homepage.html")

@app.route("/lesson")
def lesson():
  return render_template("lesson.html")

@app.route("/color_picker")
def color_picker():
  return render_template("color_picker.html")

@app.route("/quiz")
def quiz():
  return render_template("quiz.html")

if __name__ == '__main__':
  app.run(debug=True, port=5001)