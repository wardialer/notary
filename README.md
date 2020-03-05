# Notary

Notary is a Javascript implementation of a decentralized notary service using
public Bitcoin blockchain.

## Building

Use [docker build](https://docs.docker.com/engine/reference/commandline/build/)
to build the container images.

```bash
docker build -f Dockerfile.api -t notary/api api
docker build -f Dockerfile.dashboard -t notary/dashboard dashboard
```

## Usage

Use [docker-compose](https://docs.docker.com/compose/) to run the containers.

```bash
docker-compose up -d
```

and to stop them

```bash
docker-compose down
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)