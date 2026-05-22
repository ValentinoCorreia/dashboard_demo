FROM python:3

WORKDIR /opt/dashboard

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY templates .
COPY app.py .

CMD ["python", "app.py"]
