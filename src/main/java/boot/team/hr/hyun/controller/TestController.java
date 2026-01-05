package boot.team.hr.hyun.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/hyun")
@RestController
public class TestController {
    @GetMapping("/test")
    public String test(String abc){
        System.out.println("test");
        return "test";
    }
}
