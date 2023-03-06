package xkite.controllers;

import xkite.kafka.KafkaConsumer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/kafka")
public class ConsumerController {

    private KafkaConsumer kafkaConsumer;

    public ConsumerController(KafkaConsumer kafkaConsumer){this.kafkaConsumer = kafkaConsumer;}
    
//    @KafkaListener(topics = "httpTopic", groupId = "http")
    @CrossOrigin
    @GetMapping("/data")
    public ResponseEntity<String> data(@RequestParam("topic") String topic) {
        return ResponseEntity.ok("Data sent to server");
    }

}

