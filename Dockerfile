FROM python:3

WORKDIR /opt/dashboard

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY templates/ templates/
COPY app.py .

CMD ["flask", "run", "--host", "0.0.0.0"]
