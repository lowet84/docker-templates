docker run --rm \
    --link kong-db:kong-database \
    --net=docker-templates_default \
    -e "KONG_DATABASE=cassandra" \
    -e "KONG_CASSANDRA_CONTACT_POINTS=kong-database" \
    kong kong migrations bootstrap