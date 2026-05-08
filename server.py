import os
import json
import random

from flask import Flask, render_template, request, jsonify, redirect
from datetime import datetime

app = Flask(__name__)

lessons_path = os.path.join(app.root_path, 'data', 'lessons.json')

with open(lessons_path, 'r', encoding='utf-8') as f:
    lesson_info = json.load(f)


quizzes_path = os.path.join(app.root_path, 'data', 'quizzes.json')

with open(quizzes_path, 'r', encoding='utf-8') as f:
    quiz_data = json.load(f) 

@app.route("/")
def welcome():
  return render_template("homepage.html")

lesson_activity = []

@app.route("/lesson/<int:lesson_id>")
def lesson(lesson_id):
  lesson = next((l for l in lesson_info if l["id"] == lesson_id), None)

  if not lesson:
    return "Lesson not found", 404

  lesson_activity.append({
      "lesson_id": lesson_id,
      "lesson_title": lesson["title"],
      "visited_at": datetime.now().isoformat(timespec="seconds")
  })

  previous_ids = [l["id"] for l in lesson_info if l["id"] < lesson_id]
  next_ids = [l["id"] for l in lesson_info if l["id"] > lesson_id]

  prev_lesson = max(previous_ids) if previous_ids else None
  next_lesson = min(next_ids) if next_ids else None

  next_link = f"/lesson/{next_lesson}" if next_lesson else "/color_picker"

  return render_template(
    "lesson.html",
    lesson=lesson,
    prev_lesson=prev_lesson,
    next_link=next_link,
    is_last=next_lesson is None
  )

@app.route("/color_picker")
def color_picker():
  return render_template("color_picker.html")

@app.route("/quiz")
def quiz_main():
  return render_template("quiz.html", quizzes=quiz_data)

@app.route('/quiz/<int:question_num>')
def question(question_num):
    quiz = next((q for q in quiz_data if q["id"] == question_num), None)
    if not quiz:
        return "Quiz not found", 404
        
    return render_template("question.html", quiz=quiz)

user_responses = {} 

@app.route('/record_answer', methods=['POST'])
def record_answer():
    data = request.get_json()
    q_id = data.get('quiz_id')
    is_correct = data.get('is_correct')
    
    user_responses[q_id] = {
        "selected_answer": data.get("selected_answer"),
        "is_correct": is_correct,
        "answered_at": datetime.now().isoformat(timespec="seconds")
    }
    return jsonify({"status": "success"})

color_picker_data = {}

@app.route('/log_color_picker', methods=['POST'])
def log_color_picker():
    global color_picker_data

    data = request.get_json()

    color_picker_data = {
        "hue": data.get("hue"),
        "saturation": data.get("saturation"),
        "lightness": data.get("lightness"),
        "logged_at": datetime.now().isoformat(timespec="seconds")
    }

    return jsonify({"status": "success"})

@app.route('/quiz_results')
def quiz_results():
    score = sum(1 for response in user_responses.values() if response["is_correct"])
    total = len(quiz_data) + (1 if "6" in user_responses else 0)
    return render_template("quiz_result.html", score=score, total=total)

@app.route('/reset_quiz', methods=['POST'])
def reset_quiz():
    global user_responses, color_match_target
    user_responses = {}
    color_match_target = {}
    return jsonify({"status": "success"})

color_match_target = {}

@app.route('/quiz/6')
def color_match_intro():
    global color_match_target

    if "6" in user_responses:
        return redirect('/quiz/6/match')

    if not color_match_target:
        color_match_target = {
            "hue": random.randint(0, 360),
            "saturation": random.randint(25, 90),
            "lightness": random.randint(25, 75)
        }

    return render_template("color_match_intro.html", target_color=color_match_target)

@app.route('/quiz/6/match')
def color_match_play():
    if "6" not in user_responses and not color_match_target:
        return redirect('/quiz/6')

    previous_response = user_responses.get("6")

    return render_template(
        "color_match.html",
        target_color=color_match_target,
        previous_response=previous_response
    )

@app.route('/submit_color_match', methods=['POST'])
def submit_color_match():
    data = request.get_json()

    target_h = int(data.get("target_h"))
    target_s = int(data.get("target_s"))
    target_l = int(data.get("target_l"))

    h = int(data.get("hue"))
    s = int(data.get("saturation"))
    l = int(data.get("lightness"))

    hue_diff = min(abs(h - target_h), 360 - abs(h - target_h))
    sat_diff = abs(s - target_s)
    light_diff = abs(l - target_l)

    normalized_hue = hue_diff / 180
    normalized_sat = sat_diff / 100
    normalized_light = light_diff / 100

    distance = (normalized_hue + normalized_sat + normalized_light) / 3
    match_percent = max(0, round((1 - distance) * 100))

    is_correct = match_percent >= 70

    user_responses["6"] = {
        "selected_answer": {
            "hue": h,
            "saturation": s,
            "lightness": l
        },
        "target_color": {
            "hue": target_h,
            "saturation": target_s,
            "lightness": target_l
        },
        "is_correct": is_correct,
        "match_percent": match_percent,
        "answered_at": datetime.now().isoformat(timespec="seconds")
    }

    return jsonify({
        "match_percent": match_percent,
        "is_correct": is_correct,
        "target": {
            "hue": target_h,
            "saturation": target_s,
            "lightness": target_l
        },
        "user": {
            "hue": h,
            "saturation": s,
            "lightness": l
        }
    })

if __name__ == '__main__':
  app.run(debug=True, port=5001)