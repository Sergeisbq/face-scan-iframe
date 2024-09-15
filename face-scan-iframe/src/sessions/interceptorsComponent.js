import { useDispatch, useSelector } from "react-redux";
import interceptors from "../services/interceptor";
import { setLoaderOn, setLoaderOff } from "../store/reducers/appSettings";
import ContentLoader from "../components/ContentLoader";

function InterceptorsComponent(props) {
  const dispatch = useDispatch();
  const loaderOn = useSelector((state) => state.appSettings.loaderOn);

  const toggleLoader = (isTurnOn) => {
    if (isTurnOn) dispatch(setLoaderOn());
    else dispatch(setLoaderOff());
  };

  interceptors.setupInterceptors(props.history, toggleLoader);

  return <div>{loaderOn && <ContentLoader />}</div>;
}

export default InterceptorsComponent;
