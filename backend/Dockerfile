# Use official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory to the root of the project inside container
WORKDIR /app

# Copy requirements from the build context (which is ./backend) to root
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the build context (contents of backend/) into /app/backend/
COPY . ./backend/

# Expose port 8000
EXPOSE 8000

# Run uvicorn server as a package
# We are in /app, so 'backend' is a package in the current directory
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
