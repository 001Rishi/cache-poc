# Clone the repository
git clone 
cd cache-poc

# Install dependencies
npm install


# Start all cache services in detached mode
docker-compose up -d valkey keydb dragonfly memcached hazelcast

# Verify services are running
docker-compose ps



npm run start:dev
