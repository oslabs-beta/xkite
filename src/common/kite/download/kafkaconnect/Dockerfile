FROM confluentinc/cp-kafka-connect-base:latest
USER root:root
COPY ./plugins/ /opt/kafka/plugins/
ENV CONNECT_PLUGIN_PATH="/opt/kafka/plugins"
USER 1001