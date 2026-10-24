# syntax=docker/dockerfile:1
# ==============================================================================
# StockFlow Backend - Multi-stage Dockerfile (Java 21 + Spring Boot 3.4.2)
# ==============================================================================

# --- Stage 1: Build JAR ---
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy project descriptor and source
COPY pom.xml .
COPY src ./src

# Build production JAR (skipping test suite for fast packaging)
RUN mvn clean package -DskipTests -B

# --- Stage 2: Production JRE Runtime ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl

# Create non-root system group and user
RUN addgroup -S stockflow && adduser -S stockflow -G stockflow

# Copy compiled JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Adjust permissions
RUN chown -R stockflow:stockflow /app

# Run as non-root user
USER stockflow:stockflow

# Expose Spring Boot HTTP port
EXPOSE 8080

# Container Healthcheck via OpenAPI endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=35s --retries=3 \
  CMD curl -f http://localhost:8080/v3/api-docs || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
