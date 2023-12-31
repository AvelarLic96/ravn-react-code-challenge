import { useMutation } from '@apollo/client';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { ADD_TASK_MUTATION, DELETE_TASK_MUTATION } from '../graphQL/mutations';
import { useGetTasks } from '../hooks/UseRequest';
import { initialState, reducer } from './reducer';
import { Actions, DataForm } from './types';

const TasksContext = createContext(initialState);

export const TasksProvider = ({ children }: {children: ReactNode}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dataAdded, setDataAdded] = useState('');
  const [dataDeleted, setDataDeleted] = useState('');
  const [taskDelete, setTaskDelete] = useState('');
  const [dataForm, setDataForm] = useState<DataForm>({
    name: '',
    points: '',
    assignee: '',
    tags: [],
    status: 'IN_PROGRESS',
    dueDate: new Date(),
  });

  const { data, loading, refetch } = useGetTasks();
  useEffect(() => {
    dispatch({
      type: Actions.SET_TASKS,
      payload: { data, loading }
    });
  }, [data, loading]);

  const emptyData = () => {
    setDataForm({
      name: '',
      points: '',
      assignee: '',
      tags: [],
      status: 'IN_PROGRESS',
      dueDate: new Date(),
    });
  };

  const [addTask, { data: dataAdd }] = useMutation(ADD_TASK_MUTATION, {
    variables: {
      assignee: dataForm.assignee,
      dueDate: dataForm.dueDate,
      name: dataForm.name,
      points: dataForm.points,
      status: dataForm.status,
      tags: dataForm.tags,
    },
    onCompleted: refetch,
  });
  useEffect(() => {
    setDataAdded(dataAdd);
  }, [dataAdd]);

  const [deleteTask, { data: dataDelete }] = useMutation(DELETE_TASK_MUTATION, {
    variables: {
      id: taskDelete,
    },
    onCompleted: refetch,
  });
  useEffect(() => {
    setDataDeleted(dataDelete);
  }, [dataDelete]);

  const value = {
    ...state,
    dispatch,
    setDataForm,
    dataForm,
    emptyData,
    addTask,
    refetch,
    dataAdded,
    dataDeleted,
    setTaskDelete,
    deleteTask,
    setDataAdded,
    setDataDeleted,
  };
  return (
    <TasksContext.Provider value={value}> {children} </TasksContext.Provider>
  );
};

export const useTasks = () => {
  return useContext(TasksContext);
};
