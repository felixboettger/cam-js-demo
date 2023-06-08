from flask import Flask, render_template

app = Flask(__name__, static_folder="static/")



@app.route("/")
def send_camera_test():
    return render_template("cam.html")

if __name__ == "__main__":
    app.run(host='localhost')