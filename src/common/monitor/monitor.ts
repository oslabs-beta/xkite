//Monitor class to help connect to Kafka monitoring
const { spawn } = require('child_process');

export default class Monitor {
  public static initiate() {
    const child = spawn('open', ['http://localhost:3000/display']);
    child.on('error', (err: any) => {
      console.error('Failed to open localhost:', err);
    });
  }

  /*
    X Setup a repo branch from main to start the monitor lib.

It should be initiated at Kite deploy() if it’s not already initiated 

gets created with npm run server… should be a command in the library to initiate it

when it’s initiated, it should

connect to the routes on the frontend of the configuration and handles , on the backend, the request by calling and invoking kite library

and, this includes the front end for that… just making it standalone.

review the exit

sign in to Grafana

Full functionality requires the dev library.


1) @RequestMapping("/api/kafka")

public class ConsumerController {

    private KafkaConsumer kafkaConsumer;

    public ConsumerController(KafkaConsumer kafkaConsumer){this.kafkaConsumer = kafkaConsumer;}

    @GetMapping("/data")
//    @KafkaListener(topics = "httpTopic", groupId = "http")
    public ResponseEntity<String> data(@RequestParam("topic") String topic) {
        return ResponseEntity.ok("Data sent to server");
    }

    2) @RequestMapping(value = "/api/kafka")
public class JsonMessageController {
    private JsonKafkaProducer kafkaProducer;

    @JsonCreator
    public JsonMessageController(JsonKafkaProducer kafkaProducer) {
        this.kafkaProducer = kafkaProducer;
    }
    //localhost:8080/api/kafka/publish post --> {"timestamp": "1","message": "hello"}
    @PostMapping("/publish")
    public ResponseEntity<String> publish(@RequestBody KafkaMessage kafkaMessage) throws JsonProcessingException {
        kafkaProducer.sendMessage(kafkaMessage);
        return null;
    }
}
3) @RequestMapping("/api/v1/kafka")
public class MessageController {

    private KafkaProducer kafkaProducer;

    public MessageController(KafkaProducer kafkaProducer) {
        this.kafkaProducer = kafkaProducer;
    }

    // http://localhost:8080/api/v1/kafka/publish?message=hello%20world
    @GetMapping("/publish")
    public ResponseEntity<String> publish(@RequestParam("message") String message) {
        kafkaProducer.sendMessage(message);
        return ResponseEntity.ok("Message sent to Topic");
    }
}

4) @RequestMapping("api/v1/topics")

public class TopicController {
    private KafkaTopicConfig topicCreator;
    private String newTopic;

    public TopicController(KafkaTopicConfig topicCreator){
        this.topicCreator = topicCreator;
    }

//localhost:8080/api/v1/topics/create post --> {"topicname": "hello"}
    @PostMapping("/create")
    public ResponseEntity<String> newTopic (@RequestBody String topicname){
        // this.newTopic = TopicBuilder.name(topicname).build();
        NewTopic newTopic = TopicBuilder.name(topicname).build();
        return ResponseEntity.ok("New topic created");
    }
    */

  //Connect to the backend
}
