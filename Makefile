build_prod:
	npm run lint
#	cp ~/.aws/credentials containers/credentials
# 	aws s3 cp s3://personalsite-lafont/prod.env containers/prod.env
	docker build --target=production --progress=plain -t djlafo/nextjs -f containers/Dockerfile .

run_prod:
	docker rm nextjs-website || true
	docker run --env-file containers/prod.env -p 3000:3000 --name nextjs-website djlafo/nextjs 

sh:
	docker exec -it nextjs-website sh

push:
	aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 022498999375.dkr.ecr.us-east-2.amazonaws.com
	docker tag djlafo/nextjs:latest 022498999375.dkr.ecr.us-east-2.amazonaws.com/djlafo/nextjs:latest
	docker push 022498999375.dkr.ecr.us-east-2.amazonaws.com/djlafo/nextjs:latest

pull:
	aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 022498999375.dkr.ecr.us-east-2.amazonaws.com
	docker pull 022498999375.dkr.ecr.us-east-2.amazonaws.com/djlafo/nextjs:latest

sh_nginx:
	docker exec -it nextjs-nginx sh

build_nginx_prod: 
	docker build --progress=plain -t djlafo/nextjs-nginx -f containers/Dockerfile.nginx .

push_nginx:
	aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 022498999375.dkr.ecr.us-east-2.amazonaws.com
	docker tag djlafo/nextjs-nginx:latest 022498999375.dkr.ecr.us-east-2.amazonaws.com/djlafo/nextjs-nginx:latest
	docker push 022498999375.dkr.ecr.us-east-2.amazonaws.com/djlafo/nextjs-nginx:latest	