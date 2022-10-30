import { useState, useEffect } from 'react';
import { fetchImages } from './services/pixabay-api.js';
import { Searchbar } from './Searchbar/Searchbar.jsx';
import { ImageGallery } from './ImageGallery/ImageGallery.jsx';
import { Button } from './Button/Button.jsx';
import { Modal } from './Modal/Modal.jsx';
import { Loader } from './Loader/Loader.jsx';
import {
  NotificationSuccess,
  NotificationError,
  Toast,
} from './Notification/Notification.jsx';
import { Wrapper } from './App.styled.js';

const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export const App = () => {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState(Status.IDLE);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [loadMore, setLoadMore] = useState(true);

  useEffect(() => {
    if (searchQuery === '') {
      return;
    }

    const getFetch = async () => {
      setStatus(Status.PENDING);
      setLoadMore(true);

      try {
        const result = await fetchImages(searchQuery, page);

        if (!result.length) {
          throw new Error();
        }

        if (result.length < 12) {
          setLoadMore(false);
        }

        setStatus(Status.RESOLVED);
        setImages(prevState => [...prevState, ...result]);
        NotificationSuccess({ result });
      } catch (err) {
        setStatus(Status.REJECTED);
        NotificationError();
      }
    };

    getFetch();
  }, [searchQuery, page]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const loadMoreImg = () => {
    setPage(loadMore => loadMore + 1);
  };

  const findModalImage = (id, img, tags) => {
    setModalImage({ id: id, img: img, tags: tags });
  };

  const formSubmitHandler = data => {
    setPage(1);
    setImages([]);
    setSearchQuery(data);
  };

  if (status === Status.IDLE) {
    return (
      <Wrapper>
        <Searchbar onSubmit={formSubmitHandler} />;
      </Wrapper>
    );
  }

  if (status === Status.PENDING) {
    return (
      <Wrapper>
        <Searchbar onSubmit={formSubmitHandler} />
        <ImageGallery
          images={images}
          modalImage={findModalImage}
          toggleModal={toggleModal}
        />
        <Loader />
      </Wrapper>
    );
  }
  if (status === Status.RESOLVED) {
    return (
      <Wrapper>
        <Searchbar onSubmit={formSubmitHandler} />
        <ImageGallery
          images={images}
          modalImage={findModalImage}
          toggleModal={toggleModal}
        />
        {showModal && <Modal onClose={toggleModal} modalImage={modalImage} />}

        {loadMore && <Button loadMore={loadMoreImg} />}
        <Toast />
      </Wrapper>
    );
  }

  if (status === Status.REJECTED) {
    return (
      <Wrapper>
        <Searchbar onSubmit={formSubmitHandler} />
        <Toast />
      </Wrapper>
    );
  }
};
