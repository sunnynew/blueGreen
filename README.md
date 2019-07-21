# blueGreen
Testing blue green deployment on k8s

- Edit src/index.js as per deployment color.
- Service is exposed over LoadBalancer
- Open LB url in browser

Hope you have configured the Kubernetes credentials so Jenkins can deploy to our Kubernetes cluster.
If not please follow steps mentioned in jenkins section.

Steps:

1). Create Jenkins pipeline job

2). Use given Jenkinsfile  


NOTE: change serverUrl address as per your kubernetes cluster. Use `kubectl cluster-info` to know serverUrl
