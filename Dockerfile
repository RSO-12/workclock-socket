FROM denoland/deno:alpine

WORKDIR /app

COPY main.ts .
COPY util.ts .

EXPOSE 4000

CMD ["run", "--allow-net", "main.ts"]
