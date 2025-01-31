CREATE TABLE "zips" (
	"zip" char(5) PRIMARY KEY NOT NULL,
	"lat" varchar(255),
	"lng" varchar(255),
	"city" varchar(255),
	"state_id" char(2),
	"state_name" varchar(255),
	"timezone" varchar(255)
);
