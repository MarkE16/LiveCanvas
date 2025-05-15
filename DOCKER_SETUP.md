### Prerequisites
- Docker installed on your machine. You can download it from [Docker's official website](https://www.docker.com/get-started).

### Basic Setup
1. **Clone the repository**:
```bash
git clone https://github.com/MarkE16/LiveCanvas.git
cd LiveCanvas
```
2. **Build the Docker image**:
```bash
docker build -t livecanvas .
```

3. **Run the Docker container**:
```bash
docker run -p 3000:3000 livecanvas
```

4. **Access the application**:
Open your web browser and navigate to `http://localhost:3000` to see the application running.

### Running in Development
By default, the application runs in production mode. You can also run it by configurating the NODE_ENV variable to development. You can achieve this by passing
the `--build-arg` flag when building the image, and then passing the `NODE_ENV` variable:
```bash
docker build --build-arg NODE_ENV=development -t livecanvas .
```
Then run like so:
```bash
docker run -p 3000:3000 livecanvas
```