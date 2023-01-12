# Collective Service Dashboard

Client side React components for Collective Service Project

## Development

Before you start, copy `.env.example` as `.env` and set the env variables.

```bash
# Start web app
docker-compose up
```

```bash
# Generate graphql files
yarn generate

# Build web app
yarn build

# Typescript check
yarn typecheck

# Eslint check
yarn eslint

# Check unused files
yarn check-unused

# Run tests
yarn test
```

## Deployment
- Staging
    - Login to the VM.
      ```bash
        # Update client and server
        cd ~/services/client
        git pull

        cd ~/services/server
        git pull

        # Update docker containers
        cd ~/services/
        docker-compose up --build -d
      ```
- Production
    - The Github Actions deployment pipeline is triggered whenever changes are pushed to the branch `release`.
    - Requires approval from the administrator.
    - These actions update the resources in AWS.
