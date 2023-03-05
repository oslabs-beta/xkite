package xkite.controllers;


import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import xkite.kafka.JsonKafkaProducer;
import xkite.payload.KafkaMessage;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping(value = "/api/kafka")
// @CrossOrigin(origins = "http://localhost:6662")

public class JsonMessageController {
    private JsonKafkaProducer kafkaProducer;

    @JsonCreator
    public JsonMessageController(JsonKafkaProducer kafkaProducer) {
        this.kafkaProducer = kafkaProducer;
    }
    //localhost:8080/api/kafka/publish post --> {"timestamp": "1","message": "hello"}
    @CrossOrigin
    @PostMapping("/publish")
    public ResponseEntity<String> publish(@RequestBody KafkaMessage kafkaMessage) throws JsonProcessingException {
        kafkaProducer.sendMessage(kafkaMessage);
        return null;
    }
}

