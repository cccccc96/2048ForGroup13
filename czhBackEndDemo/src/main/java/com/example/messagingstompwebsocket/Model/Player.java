package com.example.messagingstompwebsocket.Model;

public class Player {

    private String name;

    private double score;

    public Player() {
    }

    public Player(String name, double score) {
        this.name = name;
        this.score = score;
    }

    public String getScore() {
        return String.valueOf(score);
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}