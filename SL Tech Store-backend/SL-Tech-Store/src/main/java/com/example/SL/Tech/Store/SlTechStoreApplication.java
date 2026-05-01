package com.example.SL.Tech.Store;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.example.SL.Tech.Store.repository")
public class SlTechStoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(SlTechStoreApplication.class, args);
	}

}
