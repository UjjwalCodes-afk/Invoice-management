pipeline {
    agent any
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/UjjwalCodes-afk/Invoice-management'
            }
        }
        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }
        stage('Build Docker Image') {
            steps {
                bat 'docker build -t invoice-management .'
            }
        }
        stage('Run Containers') {
            steps {
                bat 'docker-compose up -d --build'
            }
        }
        stage('Run Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'npm test'
                }
            }
        }
        stage('Stop Containers') {
            steps {
                bat 'docker-compose down'
            }
        }
    }
    post {
        success {
            echo '✅ Build and Deployment Successful!'
        }
        failure {
            echo '❌ Build or Deployment Failed!'
        }
    }
}
