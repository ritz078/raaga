
FROM mhart/alpine-node:10

# Create and set the default working directory
WORKDIR /usr/src

# Copy package.json and lock file for the build
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn

# Copy remaining files
COPY . .

# build and export the app
RUN yarn build
RUN yarn export -o /public
