## Socket service

Access redis on the local machine:
```bash
kubectl port-forward service/workclock-redis-service 8379:6379
```
