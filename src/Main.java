
//2.主要业务功能点：
//        本项目主要包括班级管理、小组管理、学生管理和随机点名等模块。〈
//        其中班级管理包括：新增班级、维护班级、班级列表。
//        小组管理包括：新增小组、维护小组、小组列表。
//        学生管理包括：新增学生、维护学生、学生列表。
//        随机点名模块包括：随机抽取小组，随机在小组中抽取学生，随机在班级里抽取学生，
//        给小组评分，记录学生考勤、答题情况，导出成绩。
import java.util.ArrayList;
import java.util.Random;
public class Main {
    public static void main(String[] args) {
        // 创建学生对象
        Student student1 = new Student("Alice", 1);
        Student student2 = new Student("Bob", 2);
        Student student3 = new Student("Charlie", 3);
        Student student4 = new Student("David", 4);
        Student student5 = new Student("Eve", 5);

        Group group1 = new Group("1");
        Group group2 = new Group("2");
        Group group3 = new Group("3");
        group1.addstudent(student1);
        group1.addstudent(student2);
        group2.addstudent(student3);
        group2.addstudent(student4);
        group3.addstudent(student5);
        Class class1 = new Class("1");
        class1.addgroup(group1);
        class1.addgroup(group2);
        class1.addgroup(group3);
        class1.addstudent(student1);
        class1.addstudent(student2);
        class1.addstudent(student3);
        class1.addstudent(student4);
        class1.addstudent(student5);

        Randomselect m=new Randomselect();
        m.groupstudent(group1);
        m.randomgroup(class1);
        m.randomstudent(class1);
    }
}