build:
	npm run lint
	cp ~/.aws/credentials containers/credentials
	aws s3 cp s3://personalsite-lafont/prod.env containers/prod.env
	docker build --progress=plain -t djlafo/nextjs containers

run:
	docker run --env-file ./.env -p 3000:3000 djlafo/nextjs 

sh:
	docker-run exec -it djlafo/nextjs sh