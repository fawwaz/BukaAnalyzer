import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Card,
  InputGroup,
  FormInput,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormField,
  Checkbox,
  Form,
  FormNote,
  FormSelect,
  Spinner
} from 'elemental';
import FontAwesome from 'react-fontawesome';
import { toggleModal, setKeyValue, getGraph, toggleModalHelp } from './redux/actions';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import BLApi from './lib/BLApi';
import numeral from 'numeral';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: false,
      width: 0, 
      height: 0,
      category: 159,
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      price_min: 0,
      price_max: 999999999,
      sampling: 5,
      city_suggestion: [{
        label: 'select province first',
        value: '',
        disable: false,
      }]
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }


  toggleModal = () => {
    this.props.toggleModal();
  }

  toggleModalHelp = () => {
    this.props.toggleModalHelp();
  }

  handleSearchChange = (event) => {
    this.props.setKeyValue('keyword', event.target.value);
  }

  handleSearchKeyPress = (event) => {
    if (event.key === 'Enter' ){
      const keyword = this.props.keyword;

      // parse the filter...
      const { city, province, category, price_min, price_max, sampling } = this.state;
      const _filter = {
        city,
        province,
        category: (category != "") ? parseInt(category) : 159,
        price_min: (price_min != "") ? parseInt(price_min) : 0,
        price_max: (price_max != "") ? parseInt(price_max) : 0,
        sampling: (sampling != "") ? parseInt(sampling) : 0,
      }
      this.props.getGraph(keyword, _filter);
    }
  }

  componentWillReceiveProps(nextProps){
    if(this.props.graph !== nextProps.graph){
      console.log("invoked");
    }
  }

  renderFooter() {
    if(this.props.isFetching){
      return (
        <Spinner size="md" />
      );
    }
    return(
      <Row>
        <Col sm="1/3" style={{marginLeft:'auto',marginRight:'auto'}}>
          <h4>Harga Terendah</h4>
          <h2>{numeral(this.props.min_price).format('0.0 a')}</h2>
        </Col>
        <Col sm="1/3">
          <h4>Harga Rata-Rata</h4>
          <h2>{numeral(this.props.avg_price).format('0.0 a')}</h2>
        </Col>
        <Col sm="1/3">
          <h4>Harga Termahal</h4>
          <h2>{numeral(this.props.max_price).format('0.0 a')}</h2>
        </Col>
      </Row>
    );
  }

  renderBar() {
    if(this.props.isFetching) {
      return <Spinner size="lg" />
    }

    if(this.props && this.props.graph) {
      // Parsing the data
      let data = [];
      const graphData = this.props.graph;
      for (var key in graphData) {
        if (graphData.hasOwnProperty(key)) {
          console.log(key);
          data.push({
            name:this.decideLabel(key),
            jumlah_seller: graphData[key].v,
          });
        }
      }

      const _width = this.state.width * 2 / 3 - 40;
      const _height = this.state.width * 1 / 3 - 20;
      if(data.length > 0 ) {
        return (
          <BarChart width={_width} height={_height} data={data}>
            <XAxis dataKey="name" />
            <YAxis dataKey="jumlah_seller"/>
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Bar dataKey="jumlah_seller" fill="#8884d8" />
          </BarChart>
        );
      }else{
        return(
          <h2>Start searching a keyword ...</h2>
        );
      }
    }else{
      return(
        <div>Loading...</div>
      );
    }
  }

  decideLabel(key) {
    // calculate price interval dulu
    let num_class = 0;

    const graphData = this.props.graph;
      for (var k in graphData) {
        if (graphData.hasOwnProperty(k)) {
          num_class = num_class + 1;
        }
      }
    let interval = 0;
    if(num_class > 0){
      interval = (this.props.max_price - this.props.min_price) / num_class;
    }else{ 
      interval = (this.props.max_price - this.props.min_price);
    }
    
    const min_price = this.props.min_price;
    const max_price = this.props.max_price;
    const lower_limit = min_price + key * interval;
    const upper_limit = min_price + ((key + 1) * interval) - 1;

    return `${numeral(lower_limit).format('0.0 a')} - ${numeral(upper_limit).format('0.0 a')}`
  }

  handleFormChange(key, event) {
    if(key == 'category' || key == 'province' || key == 'city') {
      this.setState({
        [key]: event
      });
      if(key == 'province' ) {
        BLApi.getCity(event).then(resp => {
          this.setState({
            city_suggestion: resp.data.cities.map(c=>{
              return {
                label: c,
                value: c,
                disable: false
              }
            })
          })
        }).catch(err => {
          console.log(err);
        });
      }
    }else{
      this.setState({
        [key]: event.target.value
      });
    }
  }

  renderFilterForm() {
    const province_list = [{
      label: 'Bali',
      value: 'Bali',
      disable: false
    },{
      label: 'Banten',
      value: 'Banten',
      disable: false
    },{
      label: 'Bengkulu',
      value: 'Bengkulu',
      disable: false
    },{
      label: 'Daerah Istimewa Yogyakarta',
      value: 'Daerah Istimewa Yogyakarta',
      disable: false
    },{
      label: 'DKI Jakarta',
      value: 'DKI Jakarta',
      disable: false
    },{
      label: 'Gorontalo',
      value: 'Gorontalo',
      disable: false
    },{
      label: 'Jambi',
      value: 'Jambi',
      disable: false
    },{
      label: 'Jawa Barat',
      value: 'Jawa Barat',
      disable: false
    },{
      label: 'Jawa Tengah',
      value: 'Jawa Tengah',
      disable: false
    },{
      label: 'Jawa Timur',
      value: 'Jawa Timur',
      disable: false
    },{
      label: 'Kalimantan Barat',
      value: 'Kalimantan Barat',
      disable: false
    },{
      label: 'Kalimantan Selatan',
      value: 'Kalimantan Selatan',
      disable: false
    },{
      label: 'Kalimantan Tengah',
      value: 'Kalimantan Tengah',
      disable: false
    },{
      label: 'Kalimantan Timur',
      value: 'Kalimantan Timur',
      disable: false
    },{
      label: 'Kalimantan Utara',
      value: 'Kalimantan Utara',
      disable: false
    },{
      label: 'Kepulauan Bangka Belitung',
      value: 'Kepulauan Bangka Belitung',
      disable: false
    },{
      label: 'Kepulauan Riau',
      value: 'Kepulauan Riau',
      disable: false
    },{
      label: 'Lampung',
      value: 'Lampung',
      disable: false
    },{
      label: 'Maluku',
      value: 'Maluku',
      disable: false
    },{
      label: 'Maluku Utara',
      value: 'Maluku Utara',
      disable: false
    },{
      label: 'Nanggroe Aceh Darussalam',
      value: 'Nanggroe Aceh Darussalam',
      disable: false
    },{
      label: 'Nusa Tenggara Barat',
      value: 'Nusa Tenggara Barat',
      disable: false
    },{
      label: 'Nusa Tenggara Timur',
      value: 'Nusa Tenggara Timur',
      disable: false
    },{
      label: 'Papua',
      value: 'Papua',
      disable: false
    },{
      label: 'Papua Barat',
      value: 'Papua Barat',
      disable: false
    },{
      label: 'Riau',
      value: 'Riau',
      disable: false
    },{
      label: 'Sulawesi Barat',
      value: 'Sulawesi Barat',
      disable: false
    },{
      label: 'Sulawesi Selatan',
      value: 'Sulawesi Selatan',
      disable: false
    },{
      label: 'Sulawesi Tengah',
      value: 'Sulawesi Tengah',
      disable: false
    },{
      label: 'Sulawesi Tenggara',
      value: 'Sulawesi Tenggara',
      disable: false
    },{
      label: 'Sulawesi Utara',
      value: 'Sulawesi Utara',
      disable: false
    },{
      label: 'Sumatera Barat',
      value: 'Sumatera Barat',
      disable: false
    },{
      label: 'Sumatera Selatan',
      value: 'Sumatera Selatan',
      disable: false
    },{
      label: 'Sumatera Utara',
      value: 'Sumatera Utara',
      disable: false
    }];

    const category_list = [{   
        label: 'Perawatan & Kecantikan',
        value: 2266,
        disable: false
    },{
        label: 'Kesehatan',
        value: 2359,
        disable: false
    },{
        label: 'Fashion Wanita',
        value: 159,
        disable: false
    },{
        label: 'Fashion Pria',
        value: 164,
        disable: false
    },{
        label: 'Handphone',
        value: 7,
        disable: false
    },{
        label: 'Komputer',
        value: 1,
        disable: false
    },{
        label: 'Elektronik',
        value: 510,
        disable: false
    },{
        label: 'Kamera',
        value: 10,
        disable: false
    },{
        label: 'Hobi & Koleksi',
        value: 58,
        disable: false
    },{
        label: 'Olahraga',
        value: 61,
        disable: false
    },{
        label: 'Sepeda',
        value: 64,
        disable: false
    },{
        label: 'Fashion Anak',
        value: 13,
        disable: false
    },{
        label: 'Perlengkapan Bayi',
        value: 68,
        disable: false
    },{
        label: 'Rumah Tangga',
        value: 65,
        disable: false
    },{
        label: 'Food',
        value: 139,
        disable: false
    },{
        label: 'Mobil Part & Accessories',
        value: 19,
        disable: false
    },{
        label: 'Motor',
        value: 471,
        disable: false
    },{
        label: 'Industrial',
        value: 1648,
        disable: false
    },{
        label: 'Perlengkapan Kantor',
        value: 70,
        disable: false
    },{
        label: 'Tiket & Voucher',
        value: 1695,
        disable: false
    }];
    return (
      <Form type="horizontal">
        <FormField label="Category">
          <FormSelect options={category_list} firstOption="Fashion Pria" onChange={(e)=>{this.handleFormChange('category',e)}} value={this.state.category}/>
        </FormField>
        <FormField label="Province">
          <FormSelect options={province_list} firstOption="DKI Jakarta" onChange={(e)=>{this.handleFormChange('province',e)}} value={this.state.province}/>
            <FormNote> Jika kamu memilih provinsi, tolong pilih juga filter kota yang bersesuaian. Lakukan ini untuk menghindari bug hasil pencarian kosong.</FormNote>
        </FormField>
        <FormField label="District">
          <FormSelect options={this.state.city_suggestion} firstOption="Select province first" onChange={(e)=>{this.handleFormChange('city',e)}} value={this.state.city}/>
            <FormNote> Pilih salah satu distrik jika kamu mengubah pronvisi diatas.</FormNote>
        </FormField>
        <FormField label="Price Min">
          <FormInput type="text" placeholder="0" name="price_min" onChange={(e)=>{this.handleFormChange('price_min',e)}} value={this.state.price_min}/>
        </FormField>
        <FormField label="Price Max">
          <FormInput type="text" placeholder="99.999.999" name="price_max" onChange={(e)=>{this.handleFormChange('price_max',e)}} value={this.state.price_max}/>
        </FormField>
        <FormField label="Sampling Size">
          <FormInput type="text" placeholder="5" name="sampling" onChange={(e)=>{this.handleFormChange('sampling',e)}} value={this.state.sampling}/>
          <FormNote> Semakin besar ukuran sampling semakin akurat namun perhitungan pun semakin lama.</FormNote>
        </FormField>
      </Form>
    );
  }

  resetFilter(){
    console.log("NAOONN");
    this.setState({
      category: 159,
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      price_min: 0,
      price_max: 999999999,
      sampling: 5,
      city_suggestion: [{
        label: 'select province first',
        value: '',
        disable: false,
      }]
    });
  }

  render() {
    return (
      <div style={styles.Appstyle}>
        <Row>
          <Col sm="1/6">

          </Col>
          <Col sm="2/3">
            <Card>
              <InputGroup>
                <InputGroup.Section>
                  <div style={{marginTop: '0.5em'}}>
                    <b>BukaAnalytics</b>
                  </div>
                </InputGroup.Section>
                <InputGroup.Section grow>
                  <FormInput
                    type="text"
                    placeholder="Ketik kata kunci, tekan enter untuk start melakukan riset"
                    value={this.props.keyword}
                    onChange={this.handleSearchChange}
                    onKeyPress={this.handleSearchKeyPress}
                  />
                </InputGroup.Section>
                <InputGroup.Section>
                  <Button type="primary" onClick={this.toggleModal} >
                    Filter
                  </Button>
                </InputGroup.Section>
                <InputGroup.Section>
                  <Button type="success" onClick={this.toggleModalHelp} >
                    Help
                  </Button>
                </InputGroup.Section>
              </InputGroup>

              <Modal isOpen={this.props.isModalOpen} onCancel={this.toggleModal} backdropClosesModal>
                <ModalHeader text="Filter" showCloseButton onClose={this.toggleModal} />
                <ModalBody>{this.renderFilterForm()}</ModalBody>
                <ModalFooter>
                  <Button type="danger" onClick={()=>{this.resetFilter()}}>Reset filter</Button>
                  {' '}
                  <Button type="primary" onClick={this.toggleModal}>Save Filter</Button>
                </ModalFooter>
              </Modal>

              <Modal isOpen={this.props.isModalHelpOpen} onCancel={this.toggleModalHelp} backdropClosesModal>
                <ModalHeader text="Halo Pelapak !" showCloseButton onClose={this.toggleModalHelp} />
                <ModalBody>
                  <p>Selamat datang di BukaAnalytics web version,</p>
                  <p>Untuk menggunakan Bukalapak Market Analyzer, kamu bisa mengetikan keyword barang tertentu di kolom search, tekan tombol enter untuk menganalisis keyword tersebut</p>
                  <p>Agar riset pasar lebih akurat, silahkan gunakan filter dengan menekan tombol biru. Di dalamnya kamu bisa menentukan filter apa yang ingin digunakan.</p>
                  <p>Kami sedang mencari volunteer untuk menguji apps kami, jika kamu pelapak / kenal dengan orang yang berjualan di bukalapak, tolong kenalkan kami dengan mereka hubungi saya di : <a href="https://m.me/fawwazmuhammad">chat ini</a> (Login dengan facebook) .</p>
                  <p>Jangan lupa untuk membantu lebih banyak pelapak lain dengan memforward informasi ini ke mereka</p>
                  <p>Terakhir, kamu bisa membaca post press release apps ini <a href="https://fawwazmuhammad.tumblr.com/post/161167208562/maafkan-kami-bukalapak">di sini</a></p>
                </ModalBody>
                <ModalFooter>
                  <Button type="primary" onClick={this.toggleModalHelp}>Ok, saya mengerti</Button>
                </ModalFooter>
              </Modal>

            </Card>
          </Col>
          <Col sm="1/6">

          </Col>
        </Row>
        <Row>
          <Col sm="1/6">

          </Col>
          <Col sm="2/3">
            <Card>
            {this.renderBar()}
            </Card>
          </Col>
          <Col sm="1/6">

          </Col>
        </Row>
        <Row>
          <Col sm="1/6">

          </Col>
          <Col sm="2/3">
            <Card>{this.renderFooter()}</Card>
          </Col>
          <Col sm="1/6">

          </Col>
        </Row>
      </div>
    );
  }
}

const styles = {
  Appstyle: {
    marginTop: 50,
  },
};

const mapStateToProps = (state, props) => {
  const { isModalOpen, isModalHelpOpen, keyword, graph, max_price, min_price, avg_price, filter, isFetching, isCalculating } = state.reducer;
  return { isModalOpen, isModalHelpOpen, keyword, graph, max_price, min_price, avg_price, filter, isFetching, isCalculating };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleModal: () => {
      dispatch(toggleModal());
    },
    toggleModalHelp: () => {
      dispatch(toggleModalHelp());
    },
    setKeyValue: (key, value) => {
      dispatch(setKeyValue(key, value));
    },
    getGraph: (keyword, filter) => {
      dispatch(getGraph(keyword, filter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
