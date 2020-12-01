package com.example.messagingstompwebsocket.Model;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

public class PlayersList {
    private static PlayersList instance;
    private Set<Player> players;

    private PlayersList(){
        players= new HashSet<>();
    }

    public static  synchronized PlayersList getInstance(){
        if(instance == null){
            instance = new PlayersList();
        }
        return instance;
    }



    public Set<Player> getPlayers() {
        return players;
    }

    public void setPlayer(String playername , Double score,int playBoard[][],int max,int max_x,int max_y ){
        if(playername=="")
            return;
        for(Player player: players){
            if(player.getName().equals(playername)){
                if(max!=player.getMax()){
                    player.setTriggered(1);
                }else{
                    player.setTriggered(0);
                }


                player.setScore(score);
                player.setPlayBoard(playBoard);
                player.setMax(max);
                player.setMaPos(max_x,max_y);
                return;
            }
        }
        players.add(new Player(playername,score,playBoard));
    }
    @Override
    public String toString() {
        return "PlayersList{" +
                "players=" + players +
                '}';
    }
}
