DC_FILE = ./docker-compose.yml
DC_COMMAND = sudo docker compose -f
# DC_COMMAND = docker compose -f
DOCKER = sudo docker
# DOCKER = docker
PROJECT_NAME = matcha

all: build

build:
	${DC_COMMAND} $(DC_FILE) up -d --build

populate:
	${DOCKER} exec $(PROJECT_NAME)_back node src/seeds/user.js

ps:
	${DC_COMMAND} $(DC_FILE) ps

stop:
	${DC_COMMAND} $(DC_FILE) stop

start:
	${DC_COMMAND} $(DC_FILE) start

log-back:
	${DOCKER} logs $(PROJECT_NAME)_back

log-front:
	${DOCKER} logs $(PROJECT_NAME)_front

log-db:
	${DOCKER} logs $(PROJECT_NAME)_db

clean:
	${DC_COMMAND} ${DC_FILE} down --remove-orphans --rmi all
	${DOCKER} system prune -af

fclean: clean
	${DC_COMMAND} ${DC_FILE} down --volumes 
	${DOCKER} system prune -af --volumes 

re: fclean all

.PHONY: all, clean, fclean, re
