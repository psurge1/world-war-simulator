package java;
import java.util.List;
import java.util.ArrayList;
import java.util.LinkedList;

public class Game {
    private List<Country> countries;
    private List<LinkedList<Country>> borderAdjacencyList;

    public Game() {
        countries = new ArrayList<>();
        borderAdjacencyList = new ArrayList<>();
    }

    public Game(Game other) {
        // copy constructor
    }

    public static void main(String[] args) {
        
    }
}