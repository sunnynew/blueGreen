pipeline {
	agent any
	options {
	timeout(time: 1, unit: 'HOURS')
	buildDiscarder(logRotator(numToKeepStr:'10'))
	disableConcurrentBuilds()
	}

	parameters {
	string(
      name: 'GIT_BRANCH',
      defaultValue: 'master',
      description: 'Select Branch?'
	)
	}

	environment {
        GIT_BRANCH='master'
        }

	stages {
		stage('Preparation') {	
			steps { 
    				//Installing kubectl in Jenkins agent
    				sh 'curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl'
					sh 'chmod +x ./kubectl && mv kubectl /usr/local/bin'

					//Clone git repository
					git url:'https://github.com/sunnynew/blueGreen.git'
					}
                }


		stage('Creating development Namespace') { 
			steps { 
					//Verify kubectl in Jenkins agent
    				withKubeConfig([credentialsId: 'jenkins-deployer-credentials', serverUrl: 'https://10.0.1.44:6443']) {
    				
    			sh '''
    			#!/bin/bash
                if [ `kubectl get ns|grep development|wc -l` -lt 1 ];then
                	kubectl create ns development
	    		else
	       			echo "Already Created."
            	fi
                '''
                }

			}
		}

		stage('Get Current Deployment') { 
			steps { 
				//Verify kubectl in Jenkins agent
    		    withKubeConfig([credentialsId: 'jenkins-deployer-credentials', serverUrl: 'https://10.0.1.44:6443'])  {
    	
    			sh '''
    			#!/bin/bash
            	if [ `kubectl get deploy -n development|grep -c nodejs-deployment` -lt 1 ];then
                  	DEPLOY="green"
                  	echo "green" > deployBuild.txt
           	 	else
               		CURR_DEPLOY=`kubectl get deploy -n development|grep nodejs-deployment|awk '{print $1}'|awk -F'-' '{print $NF}'`
                if [ $CURR_DEPLOY == "green" ]; then
                        DEPLOY="blue"
                        echo "blue" > deployBuild.txt
                  else
                        DEPLOY="green"
                        echo "green" > deployBuild.txt
                fi
            fi
            
            echo ${DEPLOY}
        	sed -i "s|COLOR|${DEPLOY}|g" deploy/deployment.yaml
        	'''
        	}
			}
		}
		stage('Deploy latest version') {	
			steps { 
    				withKubeConfig([credentialsId: 'jenkins-deployer-credentials', serverUrl: 'https://10.0.1.44:6443']) { 
    				sh 'kubectl create cm nodejs-app --from-file=src/ --namespace=development -o=yaml --dry-run > deploy/cm.yaml'
     				sh 'kubectl apply -f deploy/deployment.yaml --namespace=development'
     				sh 'kubectl apply -f deploy/cm.yaml --namespace=development'

        			//Check if SVC already deployed
    				sh '''
    				#!/bin/bash
            		if [ `kubectl get svc -n development|grep -c nodejs-service` -lt 1 ];then
               			kubectl apply -f deploy/service.yaml --namespace=development
            		fi
        			'''
					}
            }
        }
        stage('Patch Service to latest version') {	
			steps { 
    				withKubeConfig([credentialsId: 'jenkins-deployer-credentials', serverUrl: 'https://10.0.1.44:6443']) {
     				echo "Creating k8s resources..."
     				sh 'DEPLOY=$(cat deployBuild.txt)'
     				sh 'echo $DEPLOY'
     				sleep 20
     				//Note: Now with latest k8s v1.14.*, we don't get DESIRED | CURRENT columns
     				//Patch service if DESIRED pods eq CURRENT pods
     				//Remove old deployment
     				sh '''
     				#!/bin/bash
     				DEPLOY=$(cat deployBuild.txt)
     				DESIRED=$(kubectl get deploy -n development | grep nodejs-deployment-${DEPLOY} | awk '{print $2}' | awk -F'/' '{print $2}');
     				CURRENT=$(kubectl get deploy -n development | grep nodejs-deployment-${DEPLOY} | awk '{print $3}' | awk -F'/' '{print $1}');

            		if [ "$DESIRED" -eq "$CURRENT" ]; then
            		      kubectl patch svc nodejs-service -n development -p '{\"spec\":{\"selector\":{\"app\":\"nodejs\",\"label\":\"'"${DEPLOY}"'\"}}}'
            		      if [ $DEPLOY == "green" ]; then
            		           kubectl delete deploy nodejs-deployment-blue -n development
            		      else
            		           kubectl delete deploy nodejs-deployment-green -n development
            		      fi
            		fi
       				 '''

    					}
				}
        }
	}

	post {
		always {
			echo 'Job Complete'
		}
		success {
			echo 'Job Successful'
		}
		failure {
			echo 'Job Failed'
		}
		unstable {
			echo 'Job unstable'
		}
	}


}
