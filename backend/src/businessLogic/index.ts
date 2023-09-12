import todoStorage from "../helpers/attachmentUtils";
import todoRepository from "../dataLayer";
import Todos from "./todos";

const todoService = new Todos(todoStorage, todoRepository);

export default todoService;
