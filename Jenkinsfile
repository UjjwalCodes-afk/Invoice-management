pipeline {
    agent any
    environment {
        NODEJS_HOME= tool 'NodeJs 20'
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
    }
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/UjjwalCodes-afk/Invoice-management'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run Containers') {
            steps {
                sh 'docker-compose up -d'
            }
        }
        stage('Run Tests'){
            steps {
                sh 'npm test'
            }
        }
        stage('Stop Containers'){
            steps {
                sh 'docker-compose down'
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