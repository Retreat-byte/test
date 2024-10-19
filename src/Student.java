import java.util.ArrayList;

//学生管理包括：新增学生、维护学生、学生列表。
public class Student {
    private String name;
    private int id;
    private int attend;
    public Student(String name,int id)
    {
        this.name=name;
        this.id=id;
    }
    public String getName() {
        return this.name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public int getId() {
        return this.id;
    }
    public void setId(int id) {
        this.id = id;
    }

    public int getAttend() {
        return attend;
    }

    public void setAttend(int attend) {
        this.attend = attend;
    }

}
