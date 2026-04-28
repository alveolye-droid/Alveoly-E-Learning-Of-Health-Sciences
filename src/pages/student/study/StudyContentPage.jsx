import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import PostExam from "./PostExam";
import { Link } from "react-router-dom";

const StudyContentPage = () => {
  const { slug } = useParams();
  const { SERVER_URL } = useContext(AuthContext);

  const [article, setArticle] = useState(null);
  const [exam, setExam] = useState(null);

  useEffect(() => {
    axios.get(`${SERVER_URL}/api/study/article/${slug}`)
      .then(res=> setArticle(res.data))
      .catch(()=>{});

    axios.get(`${SERVER_URL}/api/study/post/${slug}/exam`)
      .then(res=> setExam(res.data))
      .catch(()=>{});
  },[slug]);

  return (
    <div className="study-content">

      {article && (
        <>
          <h1>{article.title}</h1>

          {article.content?.blocks?.map((b,i)=>{

            if(b.type==="heading") return <h2 key={i}>{b.text}</h2>;
            if(b.type==="paragraph") return <p key={i}>{b.text}</p>;
            if(b.type==="list") return (
              <ul key={i}>
                {b.items.map((it,j)=><li key={j}>{it}</li>)}
              </ul>
            );
            if(b.type==="image") return (
              <img key={i} src={b.image.url} alt="" width="400"/>
            );

            return null;
          })}

          {/* RELATED TOPICS */}
          <h3>Related Topics</h3>
          {article.relatedTopics?.map((t,i)=>(
            <Link key={i} to={`/study/${t}`}>{t}</Link>
          ))}
        </>
      )}

      {exam?.questions && <PostExam exam={exam}/>}
    </div>
  );
};

export default StudyContentPage;
