def container_queries(queries)
  data = {}

  queries.each do |name, value|
    data["data-container-query-#{name}"] = value
  end

  data
end

# eg: container_queries(small: "<500", medium: 700, iphone: "320-500")
# maybe: container_queries(500, 700, 900)
